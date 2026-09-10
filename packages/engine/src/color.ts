export class Color extends Float32Array {
  constructor(red: number, green: number, blue: number, alpha: number) {
    super([red, green, blue, alpha]);
  }
}
