export class Vec3 {
  readonly values = new Float32Array(3);

  constructor(x = 0, y = 0, z = 0) {
    this.values[0] = x;
    this.values[1] = y;
    this.values[2] = z;
  }
}
