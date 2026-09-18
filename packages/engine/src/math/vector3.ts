/**
 * Represents a three-dimensional vector.
 */
export class Vector3 extends Float32Array {
  declare [0]: number;
  declare [1]: number;
  declare [2]: number;

  constructor(x = 0, y = 0, z = 0) {
    super([x, y, z]);
  }

  get x(): number {
    return this[0];
  }

  get y(): number {
    return this[1];
  }

  get z(): number {
    return this[2];
  }

  /**
   * Creates a copy of this vector.
   *
   * @returns A new vector with the same components.
   */
  clone(): Vector3 {
    return new Vector3(this[0], this[1], this[2]);
  }

  public subtract(vector: Readonly<Vector3>): this {
    this[0] -= vector[0];
    this[1] -= vector[1];
    this[2] -= vector[2];

    return this;
  }

  public addScaled(vector: Readonly<Vector3>, scalar: number): this {
    this[0] += vector[0] * scalar;
    this[1] += vector[1] * scalar;
    this[2] += vector[2] * scalar;

    return this;
  }

  public dot(vector: Readonly<Vector3>): number {
    return this[0] * vector[0] + this[1] * vector[1] + this[2] * vector[2];
  }

  public lengthSquared(): number {
    return this.dot(this);
  }

  /**
   * Replaces each component with the smaller component from this vector and another.
   *
   * @param vector The vector to compare against.
   *
   * @returns This vector after applying the minimum value comparison.
   */
  public min(vector: Readonly<Vector3>): this {
    this[0] = Math.min(this[0], vector[0]);
    this[1] = Math.min(this[1], vector[1]);
    this[2] = Math.min(this[2], vector[2]);

    return this;
  }

  /**
   * Replaces each component with the larger component from this vector and another.
   *
   * @param vector The vector to compare against.
   *
   * @returns This vector after applying the maximum value comparison.
   */
  public max(vector: Readonly<Vector3>): this {
    this[0] = Math.max(this[0], vector[0]);
    this[1] = Math.max(this[1], vector[1]);
    this[2] = Math.max(this[2], vector[2]);

    return this;
  }

  /**
   * Determines the index of the smallest component.
   *
   * Compares the values at indices 0, 1, and 2 and returns the index of the minimum value.
   *
   * @returns The index of the smallest axis value.
   *
   * @privateRemarks Ties prefer X, then Y, then Z. This makes callers deterministic.
   */
  public minAxis(): 0 | 1 | 2 {
    if (this[0] <= this[1] && this[0] <= this[2]) {
      return 0;
    }

    return this[1] <= this[2] ? 1 : 2;
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

  public static get Zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }
}
