import type { Mat4Storage } from "./types.ts";

// column-major order
export class Mat4 {
  /** @internal */
  readonly raw = new Float32Array(16) as Mat4Storage;

  constructor() {
    this.raw[0] = 1;
    this.raw[5] = 1;
    this.raw[10] = 1;
    this.raw[15] = 1;
  }

  setTranslation(x: number, y: number, z: number): this {
    const out = this.raw;
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = x;
    out[13] = y;
    out[14] = z;
    out[15] = 1;
    return this;
  }

  // right-handed with WebGPU's 0-to-1 clip-space depth range
  // fovY in radians
  setPerspective(fovY: number, aspect: number, near: number, far: number): this {
    const focalLength = 1 / Math.tan(fovY / 2);
    const inverseDepthRange = 1 / (near - far);
    const out = this.raw;
    out[0] = focalLength / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = focalLength;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = far * inverseDepthRange;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = far * near * inverseDepthRange;
    out[15] = 0;
    return this;
  }

  setRotationX(radians: number): this {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const out = this.raw;
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = cosine;
    out[6] = sine;
    out[7] = 0;
    out[8] = 0;
    out[9] = -sine;
    out[10] = cosine;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return this;
  }

  setRotationY(radians: number): this {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const out = this.raw;
    out[0] = cosine;
    out[1] = 0;
    out[2] = -sine;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = sine;
    out[9] = 0;
    out[10] = cosine;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return this;
  }

  setRotationZ(radians: number): this {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const out = this.raw;
    out[0] = cosine;
    out[1] = sine;
    out[2] = 0;
    out[3] = 0;
    out[4] = -sine;
    out[5] = cosine;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return this;
  }

  // aliasing-safe when this === lhs or this === rhs
  setMultiply(left: Readonly<Mat4>, right: Readonly<Mat4>): this {
    // avoid repeated property access
    const lhs = left.raw;
    const rhs = right.raw;
    const out = this.raw;

    // cache all left-hand-side values upfront
    const a00 = lhs[0];
    const a01 = lhs[1];
    const a02 = lhs[2];
    const a03 = lhs[3];
    const a10 = lhs[4];
    const a11 = lhs[5];
    const a12 = lhs[6];
    const a13 = lhs[7];
    const a20 = lhs[8];
    const a21 = lhs[9];
    const a22 = lhs[10];
    const a23 = lhs[11];
    const a30 = lhs[12];
    const a31 = lhs[13];
    const a32 = lhs[14];
    const a33 = lhs[15];

    // cache four right-hand-side values at a time before writing one output column
    // to reduce pressure on local registers
    let b0 = rhs[0];
    let b1 = rhs[1];
    let b2 = rhs[2];
    let b3 = rhs[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = rhs[4];
    b1 = rhs[5];
    b2 = rhs[6];
    b3 = rhs[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = rhs[8];
    b1 = rhs[9];
    b2 = rhs[10];
    b3 = rhs[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = rhs[12];
    b1 = rhs[13];
    b2 = rhs[14];
    b3 = rhs[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return this;
  }
}
