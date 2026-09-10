import type { Vec3Storage } from "./types.ts";

export class Vec3 {
  /** @internal */
  readonly raw = new Float32Array(3) as Vec3Storage;

  constructor(x = 0, y = 0, z = 0) {
    this.raw[0] = x;
    this.raw[1] = y;
    this.raw[2] = z;
  }
}
