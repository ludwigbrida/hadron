import { describe, expect, it } from "vitest";
import { Vector3 } from "./vector3.ts";

describe(Vector3.name, () => {
  describe("constructor", () => {
    it("initializes its components", () => {
      const vector = new Vector3(1, 2, 3);

      expect([...vector]).toEqual([1, 2, 3]);
    });
  });

  describe(Vector3.prototype.setXyz, () => {
    it("sets its components in place", () => {
      const vector = new Vector3(1, 2, 3);

      expect(vector.setXyz(4, 5, 6)).toBe(vector);
      expect([...vector]).toEqual([4, 5, 6]);
    });
  });

  describe(Vector3.prototype.normalize, () => {
    it("normalizes non-zero vectors in place", () => {
      const vector = new Vector3(3, 4, 0);

      expect(vector.normalize()).toBe(vector);
      expect(vector[0]).toBe(Math.fround(0.6));
      expect(vector[1]).toBe(Math.fround(0.8));
      expect(vector[2]).toBe(0);
    });

    it("leaves zero vectors unchanged", () => {
      const vector = new Vector3(0, 0, 0);

      expect(vector.normalize()).toBe(vector);
      expect([...vector]).toEqual([0, 0, 0]);
    });
  });
});
