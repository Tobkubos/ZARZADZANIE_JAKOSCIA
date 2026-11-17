import { describe, it, expect, vi, beforeAll } from "vitest";
import { hexToRgba, themes } from "../scripts/utils/colors.js";
import { calculateCorrection, correction } from "../scripts/utils/timeManager.js";
import { SKINS, SKINS_BY_KEY, SKIN_CATEGORIES } from "../scripts/player/skins.js";
import { EFFECTS, EFFECTS_BY_KEY, handleEffects, deleteAllParticles } from "../scripts/player/effects.js";

describe("Kolory, motywy i korekcja czasu", () => {
  let getColorIndex;
  let setColors;

  beforeAll(async () => {
    document.body.innerHTML = `
      <canvas id="gameCanvas"></canvas>
      <div class="toast"></div>
      <div id="score-display"></div>
    `;
    const mod = await import("../scripts/utils/colorSetter.js");
    getColorIndex = mod.getColorIndex;
    setColors = mod.setColors;
  });

  it("hexToRgba poprawnie konwertuje HEX na RGBA", () => {
    expect(hexToRgba("#ff4d4d", 0.5)).toBe("rgba(255, 77, 77, 0.5)");
    expect(hexToRgba("#282c34")).toBe("rgba(40, 44, 52, 1)");
  });

  it("getColorIndex cyklicznie wybiera indeks motywu", () => {
    const count = Object.keys(themes).length;
    expect(getColorIndex(0, 5)).toBe(0);
    expect(getColorIndex(5, 5)).toBe(1);
    expect(getColorIndex(5 * count, 5)).toBe(0);
  });

  it("setColors aktualizuje tło, przeszkody i kolor managera", () => {
    const bg = { style: {} };
    const obstacles = [{ color: "" }, { color: "" }];
    const manager = { color: "" };

    setColors(bg, obstacles, manager, 2);

    expect(bg.style.backgroundColor).toBe(themes[2].background);
    expect(manager.color).toBe(themes[2].obstacle);
    expect(obstacles[0].color).toBe(themes[2].obstacle);
  });

  it("calculateCorrection zabezpiecza przed skokami czasu > 5", () => {
    calculateCorrection(0);
    calculateCorrection(10000);
    expect(correction).toBe(1);
  });
});

describe("Skórki i efekty gracza", () => {
  it("wszystkie skórki mają unikalne klucze i funkcję draw()", () => {
    const keys = SKINS.map((s) => s.key);
    expect(new Set(keys).size).toBe(SKINS.length);
    expect(SKINS_BY_KEY["default"]).toBeDefined();
    expect(SKIN_CATEGORIES).toContain("classic");
    expect(SKIN_CATEGORIES).toContain("image");

    for (const skin of SKINS) {
      expect(typeof skin.draw).toBe("function");
    }
  });

  it("efekty mają unikalne klucze, a handleEffects i deleteAllParticles działają bez błędów", () => {
    const keys = EFFECTS.map((e) => e.key);
    expect(new Set(keys).size).toBe(EFFECTS.length);
    expect(EFFECTS_BY_KEY["none"]).toBeDefined();

    const fakeCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn()
    };

    handleEffects(fakeCtx, { x: 10, y: 20, baseSize: 50, selectedEffect: "rocket" });
    expect(fakeCtx.fillRect).toHaveBeenCalled();

    deleteAllParticles();
  });
});