import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

const hoisted = vi.hoisted(() => ({
  deleteAllParticles: vi.fn()
}));

vi.mock("../db/DatabaseConfig.js", () => ({
  currentUserState: { user: null, data: null }
}));

vi.mock("../scripts/player/effects.js", () => ({
  deleteAllParticles: hoisted.deleteAllParticles
}));

vi.mock("../scripts/UI/ui_other.js", () => ({
  showToast: vi.fn()
}));

let state;
let SceneSwitchManager;

describe("SceneManager - przełączanie widoków (T-01, T-10, T-12)", () => {
  beforeAll(async () => {
    document.body.innerHTML = `
      <div id="menu"></div>
      <div id="gameplay" style="display:none;"></div>
      <div id="skins" style="display:none;"></div>
      <div id="effects" style="display:none;"></div>
      <div id="gameover" style="display:none;"></div>
      <div id="reward" style="display:none;"></div>
      <div id="reward-preview" style="display:none;"></div>
    `;
    const mod = await import("../scripts/sceneManager.js");
    state = mod.state;
    SceneSwitchManager = mod.SceneSwitchManager;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("T-01: przełączenie na Game pokazuje #gameplay i ukrywa pozostałe sceny", () => {
    state.playerScene = state.scenes.Game;
    SceneSwitchManager();

    expect(document.getElementById("gameplay").style.display).toBe("block");
    expect(document.getElementById("menu").style.display).toBe("none");
    expect(document.getElementById("gameover").style.display).toBe("none");
    expect(hoisted.deleteAllParticles).toHaveBeenCalledTimes(1);
  });

  it("T-12: przejście z GameOver do Menu ukrywa ekran końca gry", () => {
    state.playerScene = state.scenes.GameOver;
    SceneSwitchManager();
    expect(document.getElementById("gameover").style.display).toBe("block");
    expect(document.getElementById("gameplay").style.display).toBe("none");

    state.playerScene = state.scenes.Menu;
    SceneSwitchManager();
    expect(document.getElementById("menu").style.display).toBe("block");
    expect(document.getElementById("gameover").style.display).toBe("none");
  });

  it("T-10: przejście w stan Pause nie ukrywa sceny rozgrywki (panel pauzy jest wewnątrz #gameplay)", () => {
    state.playerScene = state.scenes.Game;
    SceneSwitchManager();
    state.playerScene = state.scenes.Pause;
    SceneSwitchManager();

    expect(document.getElementById("gameplay").style.display).toBe("block");
  });

  it("obsługuje sceny SkinSelect, EffectSelect, Reward i RewardPreview", () => {
    const map = [
      [state.scenes.SkinSelect, "skins"],
      [state.scenes.EffectSelect, "effects"],
      [state.scenes.Reward, "reward"],
      [state.scenes.RewardPreview, "reward-preview"]
    ];

    for (const [scene, activeId] of map) {
      state.playerScene = scene;
      SceneSwitchManager();
      expect(document.getElementById(activeId).style.display).toBe("block");
      expect(document.getElementById("menu").style.display).toBe("none");
    }
  });
});