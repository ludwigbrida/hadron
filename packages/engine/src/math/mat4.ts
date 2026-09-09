// column-major order
export class Mat4 {
  readonly values = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  setTranslation(x: number, y: number, z: number): this {
    this.values.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
    return this;
  }
}
