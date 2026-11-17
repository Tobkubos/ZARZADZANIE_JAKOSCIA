import { describe, it, expect, vi } from "vitest";

vi.mock("../scripts/UI/ui_other.js", () => {
  const mockCtx = { setTransform: vi.fn() };
  return {
    canvas: {
      width: 0,
      height: 0,
      getBoundingClientRect: () => ({ width: 360, height: 640 })
    },
    ctx: mockCtx,
    off: { width: 0, height: 0 },
    offCtx: mockCtx
  };
});

import {
  checkScreenSizeForOptimalGameplayMenu,
  checkScreenSizeForOptimalGameplayGame,
  checkScreenSizeForOptimalSkinsPreview
} from "../scripts/utils/resizer.js";

describe("Resizer - responsywność planszy i obiektów (T-13, J-01)", () => {
  it("skaluje gracza w menu proporcjonalnie na małym ekranie i ogranicza max do 100", () => {
    expect(checkScreenSizeForOptimalGameplayMenu({ clientWidth: 240 })).toBe(80);
    expect(checkScreenSizeForOptimalGameplayMenu({ clientWidth: 1200 })).toBe(100);
    expect(checkScreenSizeForOptimalGameplayMenu({ clientWidth: 0 })).toBe(1);
  });

  it("oblicza squareSize i playerSize dla telefonu oraz komputera", () => {
    const mobile = checkScreenSizeForOptimalGameplayGame({ clientWidth: 270 }, 10);
    expect(mobile.squareSize).toBe(80);
    expect(mobile.playerSize).toBe(50);

    const desktop = checkScreenSizeForOptimalGameplayGame({ clientWidth: 1200 }, 10);
    expect(desktop.squareSize).toBe(100);
    expect(desktop.playerSize).toBe(70);
  });

  it("oblicza rozmiar podglądu skórek (max 80)", () => {
    expect(checkScreenSizeForOptimalSkinsPreview({ clientWidth: 240 }, 15)).toBe(45);
    expect(checkScreenSizeForOptimalSkinsPreview({ clientWidth: 1200 }, 15)).toBe(80);
  });
});