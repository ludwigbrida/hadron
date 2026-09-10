export class Vec3 extends Float32Array {
  declare [0]: number;
  declare [1]: number;
  declare [2]: number;

  constructor(x: number, y: number, z: number) {
    super([x, y, z]);
  }

  set(x: number, y: number, z: number): this {
    this[0] = x;
    this[1] = y;
    this[2] = z;

    return this;
  }

  normalize(): this {
    const length = Math.hypot(this[0], this[1], this[2]);

    if (length !== 0) {
      this[0] /= length;
      this[1] /= length;
      this[2] /= length;
    }

    return this;
  }
}
