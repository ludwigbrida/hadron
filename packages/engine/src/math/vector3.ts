/**
 * Represents a three-dimensional vector.
 */
export class Vector3 extends Float32Array {
  declare [0]: number;
  declare [1]: number;
  declare [2]: number;

  constructor(x: number, y: number, z: number) {
    super([x, y, z]);
  }

  /**
   * Creates a copy of this vector.
   *
   * @returns A new vector with the same components.
   */
  clone(): Vector3 {
    return new Vector3(this[0], this[1], this[2]);
  }

  subtract(vector: Readonly<Vector3>): this {
    this[0] -= vector[0];
    this[1] -= vector[1];
    this[2] -= vector[2];

    return this;
  }

  /**
   * Sets the vector's components.
   *
   * @returns This vector.
   */
  setXyz(x: number, y: number, z: number): this {
    this[0] = x;
    this[1] = y;
    this[2] = z;

    return this;
  }

  /**
   * Normalizes this vector in place.
   *
   * A zero-length vector is left unchanged.
   *
   * @returns This vector.
   */
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
