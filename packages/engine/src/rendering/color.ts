export class Color extends Float32Array {
  constructor(red: number, green: number, blue: number, alpha = 1) {
    super([red, green, blue, alpha]);
  }

  setRgba(red: number, green: number, blue: number, alpha = 1): this {
    this[0] = red;
    this[1] = green;
    this[2] = blue;
    this[3] = alpha;

    return this;
  }
}
