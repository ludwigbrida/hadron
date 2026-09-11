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

  setLookAt(eye: Readonly<Vec3>, target: Readonly<Vec3>, up: Readonly<Vec3>): this {
    let z0 = eye[0] - target[0];
    let z1 = eye[1] - target[1];
    let z2 = eye[2] - target[2];
    let length = Math.hypot(z0, z1, z2);

    if (length === 0) {
      this.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      return this;
    }

    length = 1 / length;
    z0 *= length;
    z1 *= length;
    z2 *= length;

    let x0 = up[1] * z2 - up[2] * z1;
    let x1 = up[2] * z0 - up[0] * z2;
    let x2 = up[0] * z1 - up[1] * z0;
    length = Math.hypot(x0, x1, x2);

    if (length === 0) {
      this.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      return this;
    }

    length = 1 / length;
    x0 *= length;
    x1 *= length;
    x2 *= length;

    const y0 = z1 * x2 - z2 * x1;
    const y1 = z2 * x0 - z0 * x2;
    const y2 = z0 * x1 - z1 * x0;

    this[0] = x0;
    this[1] = y0;
    this[2] = z0;
    this[3] = 0;
    this[4] = x1;
    this[5] = y1;
    this[6] = z1;
    this[7] = 0;
    this[8] = x2;
    this[9] = y2;
    this[10] = z2;
    this[11] = 0;
    this[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
    this[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
    this[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
    this[15] = 1;

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

  scale(scale: Readonly<Vec3>): this {
    const x = scale[0];
    const y = scale[1];
    const z = scale[2];

    this[0] *= x;
    this[1] *= x;
    this[2] *= x;
    this[3] *= x;
    this[4] *= y;
    this[5] *= y;
    this[6] *= y;
    this[7] *= y;
    this[8] *= z;
    this[9] *= z;
    this[10] *= z;
    this[11] *= z;

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

  rotateZ(radians: number): this {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    const x0 = this[0];
    const x1 = this[1];
    const x2 = this[2];
    const x3 = this[3];
    const y0 = this[4];
    const y1 = this[5];
    const y2 = this[6];
    const y3 = this[7];

    this[0] = x0 * cosine + y0 * sine;
    this[1] = x1 * cosine + y1 * sine;
    this[2] = x2 * cosine + y2 * sine;
    this[3] = x3 * cosine + y3 * sine;
    this[4] = y0 * cosine - x0 * sine;
    this[5] = y1 * cosine - x1 * sine;
    this[6] = y2 * cosine - x2 * sine;
    this[7] = y3 * cosine - x3 * sine;

    return this;
  }

  // aliasing-safe when this is the input
  setInverse(matrix: Readonly<Mat4>): this {
    const m00 = matrix[0];
    const m01 = matrix[1];
    const m02 = matrix[2];
    const m03 = matrix[3];
    const m10 = matrix[4];
    const m11 = matrix[5];
    const m12 = matrix[6];
    const m13 = matrix[7];
    const m20 = matrix[8];
    const m21 = matrix[9];
    const m22 = matrix[10];
    const m23 = matrix[11];
    const m30 = matrix[12];
    const m31 = matrix[13];
    const m32 = matrix[14];
    const m33 = matrix[15];

    const c00 = m00 * m11 - m01 * m10;
    const c01 = m00 * m12 - m02 * m10;
    const c02 = m00 * m13 - m03 * m10;
    const c03 = m01 * m12 - m02 * m11;
    const c04 = m01 * m13 - m03 * m11;
    const c05 = m02 * m13 - m03 * m12;
    const c06 = m20 * m31 - m21 * m30;
    const c07 = m20 * m32 - m22 * m30;
    const c08 = m20 * m33 - m23 * m30;
    const c09 = m21 * m32 - m22 * m31;
    const c10 = m21 * m33 - m23 * m31;
    const c11 = m22 * m33 - m23 * m32;

    const determinant = c00 * c11 - c01 * c10 + c02 * c09 + c03 * c08 - c04 * c07 + c05 * c06;

    if (determinant === 0) {
      // TODO: handle this more gracefully
      throw new Error("Matrix is not invertible.");
    }

    const inverseDeterminant = 1 / determinant;

    this[0] = (m11 * c11 - m12 * c10 + m13 * c09) * inverseDeterminant;
    this[1] = (m02 * c10 - m01 * c11 - m03 * c09) * inverseDeterminant;
    this[2] = (m31 * c05 - m32 * c04 + m33 * c03) * inverseDeterminant;
    this[3] = (m22 * c04 - m21 * c05 - m23 * c03) * inverseDeterminant;
    this[4] = (m12 * c08 - m10 * c11 - m13 * c07) * inverseDeterminant;
    this[5] = (m00 * c11 - m02 * c08 + m03 * c07) * inverseDeterminant;
    this[6] = (m32 * c02 - m30 * c05 - m33 * c01) * inverseDeterminant;
    this[7] = (m20 * c05 - m22 * c02 + m23 * c01) * inverseDeterminant;
    this[8] = (m10 * c10 - m11 * c08 + m13 * c06) * inverseDeterminant;
    this[9] = (m01 * c08 - m00 * c10 - m03 * c06) * inverseDeterminant;
    this[10] = (m30 * c04 - m31 * c02 + m33 * c00) * inverseDeterminant;
    this[11] = (m21 * c02 - m20 * c04 - m23 * c00) * inverseDeterminant;
    this[12] = (m11 * c07 - m10 * c09 - m12 * c06) * inverseDeterminant;
    this[13] = (m00 * c09 - m01 * c07 + m02 * c06) * inverseDeterminant;
    this[14] = (m31 * c01 - m30 * c03 - m32 * c00) * inverseDeterminant;
    this[15] = (m20 * c03 - m21 * c01 + m22 * c00) * inverseDeterminant;

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
