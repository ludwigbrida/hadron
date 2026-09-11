export class Color extends Float32Array {
  constructor(red: number, green: number, blue: number, alpha = 1) {
    super([red, green, blue, alpha]);
  }
}
