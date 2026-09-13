import { describe, expect, it } from "vitest";
import { Vector3 } from "./vector3.ts";

describe(Vector3.name, () => {
  it("initializes its components", () => {
    const vector = new Vector3(1, 2, 3);

    expect([...vector]).toEqual([1, 2, 3]);
  });
});
