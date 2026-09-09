// column-major order
export class Mat4 {
  readonly values = new Float32Array(16);

  constructor() {
    this.values[0] = 1;
    this.values[5] = 1;
    this.values[10] = 1;
    this.values[15] = 1;
  }

  static fromTranslation(out: Mat4, x: number, y: number, z: number): Mat4 {
    const t = out.values;
    t[0] = 1;
    t[1] = 0;
    t[2] = 0;
    t[3] = 0;
    t[4] = 0;
    t[5] = 1;
    t[6] = 0;
    t[7] = 0;
    t[8] = 0;
    t[9] = 0;
    t[10] = 1;
    t[11] = 0;
    t[12] = x;
    t[13] = y;
    t[14] = z;
    t[15] = 1;
    return out;
  }

  // right-handed with WebGPU's 0-to-1 clip-space depth range
  static fromPerspective(out: Mat4, fovY: number, aspect: number, near: number, far: number): Mat4 {
    const focalLength = 1 / Math.tan(fovY / 2);
    const depthRange = 1 / (near - far);
    const p = out.values;
    p[0] = focalLength / aspect;
    p[1] = 0;
    p[2] = 0;
    p[3] = 0;
    p[4] = 0;
    p[5] = focalLength;
    p[6] = 0;
    p[7] = 0;
    p[8] = 0;
    p[9] = 0;
    p[10] = far * depthRange;
    p[11] = -1;
    p[12] = 0;
    p[13] = 0;
    p[14] = far * near * depthRange;
    p[15] = 0;
    return out;
  }

  static fromRotationX(out: Mat4, radians: number): Mat4 {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const r = out.values;
    r[0] = 1;
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = cosine;
    r[6] = sine;
    r[7] = 0;
    r[8] = 0;
    r[9] = -sine;
    r[10] = cosine;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;
    return out;
  }

  static fromRotationY(out: Mat4, radians: number): Mat4 {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const r = out.values;
    r[0] = cosine;
    r[1] = 0;
    r[2] = -sine;
    r[3] = 0;
    r[4] = 0;
    r[5] = 1;
    r[6] = 0;
    r[7] = 0;
    r[8] = sine;
    r[9] = 0;
    r[10] = cosine;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;
    return out;
  }

  static fromRotationZ(out: Mat4, radians: number): Mat4 {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const r = out.values;
    r[0] = cosine;
    r[1] = sine;
    r[2] = 0;
    r[3] = 0;
    r[4] = -sine;
    r[5] = cosine;
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = 1;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;
    return out;
  }

  // aliasing-safe multiply when out === lhs or out === rhs
  static multiply(out: Mat4, lhs: Readonly<Mat4>, rhs: Readonly<Mat4>): Mat4 {
    const a = lhs.values;
    const b = rhs.values;
    const o = out.values;

    // cache all left-hand-side values upfront
    const a00 = a[0]!;
    const a01 = a[1]!;
    const a02 = a[2]!;
    const a03 = a[3]!;
    const a10 = a[4]!;
    const a11 = a[5]!;
    const a12 = a[6]!;
    const a13 = a[7]!;
    const a20 = a[8]!;
    const a21 = a[9]!;
    const a22 = a[10]!;
    const a23 = a[11]!;
    const a30 = a[12]!;
    const a31 = a[13]!;
    const a32 = a[14]!;
    const a33 = a[15]!;

    // cache four right-hand-side values at a time before writing one output column
    // to reduce pressure on local registers
    let b0 = b[0]!;
    let b1 = b[1]!;
    let b2 = b[2]!;
    let b3 = b[3]!;
    o[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    o[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    o[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    o[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4]!;
    b1 = b[5]!;
    b2 = b[6]!;
    b3 = b[7]!;
    o[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    o[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    o[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    o[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8]!;
    b1 = b[9]!;
    b2 = b[10]!;
    b3 = b[11]!;
    o[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    o[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    o[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    o[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12]!;
    b1 = b[13]!;
    b2 = b[14]!;
    b3 = b[15]!;
    o[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    o[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    o[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    o[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return out;
  }
}
