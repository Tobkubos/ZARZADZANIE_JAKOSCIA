import { describe, it, expect, vi, beforeEach } from "vitest";

const hoisted = vi.hoisted(() => ({
  mockPlayer: { isDead: false },
  updateScoreText: vi.fn(),
  setColors: vi.fn(),
  getColorIndex: vi.fn(() => 1)
}));

vi.mock("../main.js", () => ({
  player: hoisted.mockPlayer
}));

vi.mock("../scripts/UI/ui_menu.js", () => ({
  updateScoreText: hoisted.updateScoreText
}));

vi.mock("../scripts/UI/ui_other.js", () => ({
  canvas: { clientWidth: 300, clientHeight: 600 }
}));

vi.mock("../scripts/utils/colorSetter.js", () => ({
  gameBackground: { style: {} },
  getColorIndex: hoisted.getColorIndex,
  setColors: hoisted.setColors
}));

import { ObstacleManager, Obstacle } from "../scripts/obstaclesManager.js";

describe("Obstacle i ObstacleManager (T-06, T-07, T-08, T-09, T-11)", () => {
  let manager;

  beforeEach(() => {
    hoisted.mockPlayer.isDead = false;
    vi.clearAllMocks();
    manager = new ObstacleManager();
  });

  it("T-06: przeszkoda przechodzi przez stany warning -> spawn -> fall", () => {
    const obs = new Obstacle([0], 3, "#ff0000", 0.2);
    expect(obs.state).toBe("warning");

    // W stanie warning timer musi przekroczyć 36
    for (let i = 0; i < 37; i++) {
      obs.update();
    }
    expect(obs.state).toBe("spawn");
    expect(obs.scale).toBe(0);

    // W stanie spawn skala rośnie o 0.08 aż osiągnie >= 1
    for (let i = 0; i < 13; i++) {
      obs.update();
    }
    expect(obs.state).toBe("fall");
    expect(obs.scale).toBe(1);
    expect(obs.velocityY).toBe(3);

    const yBefore = obs.y;
    obs.update();
    expect(obs.y).toBeGreaterThan(yBefore);
    expect(obs.rotation).toBeGreaterThan(0);
  });

  it("J-05: brak kolizji w stanach 'warning' i 'spawn'", () => {
    const obs = new Obstacle([1], 3, "#ff0000", 0.2);
    obs.y = 400;
    const playerRect = { x: 110, y: 400, baseSize: 50 };

    expect(manager.isColliding(playerRect, obs, 90)).toBe(false);

    obs.state = "spawn";
    expect(manager.isColliding(playerRect, obs, 90)).toBe(false);
  });

  it("T-07: wykrywa kolizję na zajętym pasie dla przeszkody wielopasowej [0, 2]", () => {
    const obs = new Obstacle([0, 2], 3, "#ff0000", 0.2);
    obs.state = "fall";
    obs.y = 400;
    const squareSize = 90; // startX = (300 - 270)/2 = 15

    // Pas 0 (x od 15 do 105) -> kolizja
    expect(manager.isColliding({ x: 25, y: 410, baseSize: 50 }, obs, squareSize)).toBe(true);
    // Pas 2 (x od 195 do 285) -> kolizja
    expect(manager.isColliding({ x: 205, y: 410, baseSize: 50 }, obs, squareSize)).toBe(true);
  });

  it("T-08: ominięcie przeszkody (bezpieczny pas) nie powoduje kolizji i nalicza +1 pkt po opuszczeniu planszy", () => {
    const obs = new Obstacle([0, 2], 3, "#ff0000", 0.2);
    obs.state = "fall";
    obs.y = 400;
    const squareSize = 90;

    // Pas 1 (x od 105 do 195) z graczem szerokości 50 (np. x=125..175) -> brak kolizji
    expect(manager.isColliding({ x: 125, y: 410, baseSize: 50 }, obs, squareSize)).toBe(false);

    // Przeszkoda wypada poza limitY (canvasHeight + 100 = 700)
    obs.y = 750;
    manager.obstacles.push(obs);
    manager.update(600);

    expect(manager.obstacles).toHaveLength(0);
    expect(manager.score).toBe(1);
    expect(hoisted.updateScoreText).toHaveBeenCalledWith(1);
  });

  it("nie nalicza punktów za przeszkody, jeśli gracz już nie żyje", () => {
    hoisted.mockPlayer.isDead = true;
    const obs = new Obstacle([0], 3, "#ff0000", 0.2);
    obs.state = "fall";
    obs.y = 800;

    manager.obstacles.push(obs);
    manager.update(600);

    expect(manager.score).toBe(0);
  });

  it("T-09: zwiększa trudność na progu co 10 punktów bez zerowania wyniku", () => {
    manager.score = 9;
    const obs = new Obstacle([0], 3, "#ff0000", 0.2);
    obs.state = "fall";
    obs.y = 800;
    manager.obstacles.push(obs);

    manager.update(600);

    expect(manager.score).toBe(10);
    expect(manager.warningCooldown).toBe(55); // 60 - 5
    expect(manager.baseAcceleration).toBeCloseTo(0.25); // 0.2 + 0.05
    expect(hoisted.setColors).toHaveBeenCalled();
  });

  it("T-11 / J-06: reset() czyści przeszkody, zeruje wynik i przywraca parametry początkowe", () => {
    manager.obstacles.push(new Obstacle([1], 6, "#ff0000", 0.4));
    manager.score = 30;
    manager.warningCooldown = 35;
    manager.baseAcceleration = 0.45;

    manager.reset();

    expect(manager.obstacles).toHaveLength(0);
    expect(manager.score).toBe(0);
    expect(manager.speed).toBe(3);
    expect(manager.warningCooldown).toBe(60);
    expect(manager.baseAcceleration).toBe(0.2);
  });
});