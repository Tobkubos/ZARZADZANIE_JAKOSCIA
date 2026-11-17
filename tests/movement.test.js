import { describe, it, expect, vi, beforeEach } from "vitest";

const hoisted = vi.hoisted(() => ({
  mockSceneState: {
    playerScene: "Game",
    scenes: { Menu: "Menu", Game: "Game", Pause: "Pause", GameOver: "GameOver" }
  },
  mockPlayer: {
    lane: 1,
    isDead: false,
    move(dir) {
      if (this.isDead) return;
      this.lane = Math.max(0, Math.min(2, this.lane + dir));
    }
  }
}));

vi.mock("../scripts/sceneManager.js", () => ({
  state: hoisted.mockSceneState
}));

vi.mock("../main.js", () => ({
  player: hoisted.mockPlayer
}));

import { lerp } from "../scripts/player/movementHandler.js";

function dispatchTouch(type, screenX) {
  const event = new Event(type);
  Object.defineProperty(event, "changedTouches", {
    value: [{ screenX }]
  });
  document.dispatchEvent(event);
}

function dispatchMouse(type, screenX) {
  const event = new MouseEvent(type, { screenX });
  document.dispatchEvent(event);
}

describe("MovementHandler - sterowanie dotykiem i myszą (T-02, T-03, T-05, J-09)", () => {
  beforeEach(() => {
    hoisted.mockSceneState.playerScene = "Game";
    hoisted.mockPlayer.lane = 1;
    hoisted.mockPlayer.isDead = false;
  });

  it("T-02: gest dotykiem w lewo i w prawo zmienia pas gracza", () => {
    dispatchTouch("touchstart", 200);
    dispatchTouch("touchend", 140); // -60px -> w lewo
    expect(hoisted.mockPlayer.lane).toBe(0);

    dispatchTouch("touchstart", 100);
    dispatchTouch("touchend", 160); // +60px -> w prawo
    expect(hoisted.mockPlayer.lane).toBe(1);
  });

  it("T-03: ruch myszą w lewo i w prawo działa tak samo jak dotyk", () => {
    dispatchMouse("mousedown", 300);
    dispatchMouse("mouseup", 360); // +60px -> w prawo
    expect(hoisted.mockPlayer.lane).toBe(2);

    dispatchMouse("mousedown", 300);
    dispatchMouse("mouseup", 240); // -60px -> w lewo
    expect(hoisted.mockPlayer.lane).toBe(1);
  });

  it("ignoruje przypadkowe przesunięcia mniejsze niż próg 30px", () => {
    dispatchTouch("touchstart", 200);
    dispatchTouch("touchend", 180); // tylko 20px
    expect(hoisted.mockPlayer.lane).toBe(1);

    dispatchMouse("mousedown", 200);
    dispatchMouse("mouseup", 225); // tylko 25px
    expect(hoisted.mockPlayer.lane).toBe(1);
  });

  it("ignoruje gesty, gdy gra nie jest w scenie Game (np. Menu lub Pause)", () => {
    hoisted.mockSceneState.playerScene = "Menu";
    dispatchTouch("touchstart", 200);
    dispatchTouch("touchend", 100);
    expect(hoisted.mockPlayer.lane).toBe(1);

    hoisted.mockSceneState.playerScene = "Pause";
    dispatchMouse("mousedown", 100);
    dispatchMouse("mouseup", 250);
    expect(hoisted.mockPlayer.lane).toBe(1);
  });

  it("T-05: seria szybkich gestów dotykowych utrzymuje gracza w zakresie 0..2", () => {
    for (let i = 0; i < 6; i++) {
      dispatchTouch("touchstart", 250);
      dispatchTouch("touchend", 150);
    }
    expect(hoisted.mockPlayer.lane).toBe(0);

    for (let i = 0; i < 6; i++) {
      dispatchTouch("touchstart", 150);
      dispatchTouch("touchend", 250);
    }
    expect(hoisted.mockPlayer.lane).toBe(2);
  });

  it("lerp poprawnie interpoluje pozycję gracza", () => {
    expect(lerp(0, 100, 0.2)).toBeCloseTo(20);
    expect(lerp(50, 150, 0.5)).toBeCloseTo(100);
    expect(lerp(10, 90, 0)).toBe(10);
    expect(lerp(10, 90, 1)).toBe(90);
  });
});