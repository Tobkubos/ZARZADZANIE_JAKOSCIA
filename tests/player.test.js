import { describe, it, expect, beforeEach } from "vitest";
import { Player } from "../scripts/player/player.js";

describe("Player - logika pasów i stanu (T-04, T-05, J-02)", () => {
  let player;

  beforeEach(() => {
    player = new Player(0, 0, 50);
  });

  it("domyślnie startuje na środkowym pasie (1) i jest żywy", () => {
    expect(player.lane).toBe(1);
    expect(player.isDead).toBe(false);
  });

  it("T-04: pozostaje w skrajnym lewym (0) i prawym (2) pasie przy próbie wyjścia poza planszę", () => {
    player.move(-1);
    player.move(-1);
    player.move(-1);
    expect(player.lane).toBe(0);

    player.move(1);
    player.move(1);
    player.move(1);
    expect(player.lane).toBe(2);
  });

  it("T-05: po serii szybkich naprzemiennych ruchów zawsze mieści się w zakresie 0..2", () => {
    const sequence = [-1, -1, 1, -1, -1, -1, 1, 1, 1, 1, -1];
    for (const dir of sequence) {
      player.move(dir);
      expect(player.lane).toBeGreaterThanOrEqual(0);
      expect(player.lane).toBeLessThanOrEqual(2);
    }
    expect(player.lane).toBe(1);
  });

  it("blokuje zmianę pasa po wywołaniu die()", () => {
    player.die();
    expect(player.isDead).toBe(true);

    player.move(-1);
    expect(player.lane).toBe(1);
  });

  it("setPlayerPosition ustawia współrzędne x i y", () => {
    player.setPlayerPosition(120, 340);
    expect(player.x).toBe(120);
    expect(player.y).toBe(340);
  });
});