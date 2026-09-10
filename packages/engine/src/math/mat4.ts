import type { Vec3 } from "./vec3.ts";

// column-major order
export class Mat4 extends Float32Array {
  declare [0]: number;
  declare [1]: number;
  declare [2]: number;
  declare [3]: number;
  declare [4]: number;
  declare [5]: number;
  declare [6]: number;
  declare [7]: number;
  declare [8]: number;
  declare [9]: number;
  declare [10]: number;
  declare [11]: number;
  declare [12]: number;
  declare [13]: number;
  declare [14]: number;
  declare [15]: number;

  constructor() {
    super([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  setTranslation(translation: Readonly<Vec3>): this {
    this[0] = 1;
    this[1] = 0;
    this[2] = 0;
    this[3] = 0;
    this[4] = 0;
    this[5] = 1;
    this[6] = 0;
    this[7] = 0;
    this[8] = 0;
    this[9] = 0;
    this[10] = 1;
    this[11] = 0;
    this[12] = translation[0];
    this[13] = translation[1];
    this[14] = translation[2];
    this[15] = 1;

    return this;
  }

  // right-handed with WebGPU's 0-to-1 clip-space depth range
  // fovY in radians
  setPerspective(fovY: number, aspect: number, near: number, far: number): this {
    const focalLength = 1 / Math.tan(fovY / 2);
    const inverseDepthRange = 1 / (near - far);

    this[0] = focalLength / aspect;
    this[1] = 0;
    this[2] = 0;
    this[3] = 0;
    this[4] = 0;
    this[5] = focalLength;
    this[6] = 0;
    this[7] = 0;
    this[8] = 0;
    this[9] = 0;
    this[10] = far * inverseDepthRange;
    this[11] = -1;
    this[12] = 0;
    this[13] = 0;
    this[14] = far * near * inverseDepthRange;
    this[15] = 0;

    return this;
  }

  setRotationX(radians: number): this {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    this[0] = 1;
    this[1] = 0;
    this[2] = 0;
    this[3] = 0;
    this[4] = 0;
    this[5] = cosine;
    this[6] = sine;
    this[7] = 0;
    this[8] = 0;
    this[9] = -sine;
    this[10] = cosine;
    this[11] = 0;
    this[12] = 0;
    this[13] = 0;
    this[14] = 0;
    this[15] = 1;

    return this;
  }

  rotateX(radians: number): this {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    const y0 = this[4];
    const y1 = this[5];
    const y2 = this[6];
    const y3 = this[7];
    const z0 = this[8];
    const z1 = this[9];
    const z2 = this[10];
    const z3 = this[11];

    this[4] = y0 * cosine + z0 * sine;
    this[5] = y1 * cosine + z1 * sine;
    this[6] = y2 * cosine + z2 * sine;
    this[7] = y3 * cosine + z3 * sine;
    this[8] = z0 * cosine - y0 * sine;
    this[9] = z1 * cosine - y1 * sine;
    this[10] = z2 * cosine - y2 * sine;
    this[11] = z3 * cosine - y3 * sine;

    return this;
  }

  setRotationY(radians: number): this {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    this[0] = cosine;
    this[1] = 0;
    this[2] = -sine;
    this[3] = 0;
    this[4] = 0;
    this[5] = 1;
    this[6] = 0;
    this[7] = 0;
    this[8] = sine;
    this[9] = 0;
    this[10] = cosine;
    this[11] = 0;
    this[12] = 0;
    this[13] = 0;
    this[14] = 0;
    this[15] = 1;

    return this;
  }

  rotateY(radians: number): this {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    const x0 = this[0];
    const x1 = this[1];
    const x2 = this[2];
    const x3 = this[3];
    const z0 = this[8];
    const z1 = this[9];
    const z2 = this[10];
    const z3 = this[11];

    this[0] = x0 * cosine - z0 * sine;
    this[1] = x1 * cosine - z1 * sine;
    this[2] = x2 * cosine - z2 * sine;
    this[3] = x3 * cosine - z3 * sine;
    this[8] = x0 * sine + z0 * cosine;
    this[9] = x1 * sine + z1 * cosine;
    this[10] = x2 * sine + z2 * cosine;
    this[11] = x3 * sine + z3 * cosine;

    return this;
  }

  setRotationZ(radians: number): this {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    this[0] = cosine;
    this[1] = sine;
    this[2] = 0;
    this[3] = 0;
    this[4] = -sine;
    this[5] = cosine;
    this[6] = 0;
    this[7] = 0;
    this[8] = 0;
    this[9] = 0;
    this[10] = 1;
    this[11] = 0;
    this[12] = 0;
    this[13] = 0;
    this[14] = 0;
    this[15] = 1;

    return this;
  }

  // aliasing-safe when this is either input
  setMultiply(left: Readonly<Mat4>, right: Readonly<Mat4>): this {
    // cache all left-hand-side values upfront
    const a00 = left[0];
    const a01 = left[1];
    const a02 = left[2];
    const a03 = left[3];
    const a10 = left[4];
    const a11 = left[5];
    const a12 = left[6];
    const a13 = left[7];
    const a20 = left[8];
    const a21 = left[9];
    const a22 = left[10];
    const a23 = left[11];
    const a30 = left[12];
    const a31 = left[13];
    const a32 = left[14];
    const a33 = left[15];

    // cache four right-hand-side values at a time before writing one output column
    // to reduce pressure on local registers
    let b0 = right[0];
    let b1 = right[1];
    let b2 = right[2];
    let b3 = right[3];
    this[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    this[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    this[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    this[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = right[4];
    b1 = right[5];
    b2 = right[6];
    b3 = right[7];
    this[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    this[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    this[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    this[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = right[8];
    b1 = right[9];
    b2 = right[10];
    b3 = right[11];
    this[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    this[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    this[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    this[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = right[12];
    b1 = right[13];
    b2 = right[14];
    b3 = right[15];
    this[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    this[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    this[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    this[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return this;
  }

  multiply(right: Readonly<Mat4>): this {
    return this.setMultiply(this, right);
  }
}
