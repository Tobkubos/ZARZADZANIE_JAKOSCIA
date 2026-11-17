import { describe, it, expect, vi, beforeAll } from "vitest";

const hoisted = vi.hoisted(() => ({
  userState: { user: null, data: null }
}));

vi.mock("../scripts/sceneManager.js", () => ({
  state: { playerScene: "Menu", scenes: { Game: "Game", Pause: "Pause" } },
  SceneSwitchManager: vi.fn()
}));

vi.mock("../db/DatabaseConfig.js", () => ({
  currentUserState: hoisted.userState,
  DB_loginAndCreateProfile: vi.fn(),
  DB_logoutUser: vi.fn(),
  DB_getTop10Scores: vi.fn(async () => [])
}));

vi.mock("../main.js", () => ({
  obstacleManager: { reset: vi.fn() }
}));

vi.mock("../scripts/utils/sceneTransition.js", () => ({
  animateSceneTransition: vi.fn()
}));

let updateUI;
let updateHighscoreLOCAL;

describe("UI Menu - tryb niezalogowany vs zalogowany (T-14, J-07, J-08)", () => {
  beforeAll(async () => {
    document.body.innerHTML = `
      <h1 class="menu-game-name">SWIPE</h1>
      <div id="user-status"></div>
      <div class="menu-info-highscore">0</div>
      <div id="score-display">0</div>
      <button class="start-btn"></button>
      <button class="pause-btn"></button>
      <button class="close-pause-btn"></button>
      <div id="pause-panel"></div>
      <button class="how-to-play-btn"></button>
      <button class="highscore-btn"></button>
      <button class="options-btn"></button>
      <button class="login-btn"></button>
      <button class="logout-btn"></button>
      <button class="menu-btn locked"><img class="lock-overlay" /></button>
    `;
    const mod = await import("../scripts/UI/ui_menu.js");
    updateUI = mod.updateUI;
    updateHighscoreLOCAL = mod.updateHighscoreLOCAL;
  });

  it("T-14 / J-07: dla użytkownika niezalogowanego pokazuje blokady i informację o braku konta", () => {
    hoisted.userState.user = null;
    hoisted.userState.data = null;

    updateUI();

    expect(document.getElementById("user-status").innerText).toBe("Data unlinked - not logged in");
    expect(document.querySelector(".login-btn").style.display).toBe("block");
    expect(document.querySelector(".logout-btn").style.display).toBe("none");
    expect(document.querySelector(".lock-overlay").style.display).toBe("block");
    expect(document.querySelector(".menu-btn.locked").style.opacity).toBe("0.5");
    expect(document.querySelector(".menu-info-highscore").innerText).toBe(0);
  });

  it("J-08: dla zalogowanego użytkownika odblokowuje funkcje i wyświetla rekord z profilu", () => {
    hoisted.userState.user = { displayName: "Jan Kowalski" };
    hoisted.userState.data = { highScore: 42 };

    updateUI();

    expect(document.getElementById("user-status").innerText).toBe("Logged as: Jan Kowalski");
    expect(document.querySelector(".login-btn").style.display).toBe("none");
    expect(document.querySelector(".logout-btn").style.display).toBe("block");
    expect(document.querySelector(".lock-overlay").style.display).toBe("none");
    expect(document.querySelector(".menu-btn.locked").style.opacity).toBe("1");
    expect(document.querySelector(".menu-info-highscore").innerText).toBe(42);
  });

  it("updateHighscoreLOCAL aktualizuje lokalny rekord w menu", () => {
    updateHighscoreLOCAL(17);
    expect(document.querySelector(".menu-info-highscore").innerText).toBe(17);
  });
});