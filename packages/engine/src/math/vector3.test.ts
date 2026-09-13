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
});
