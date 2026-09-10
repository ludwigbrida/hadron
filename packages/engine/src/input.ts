export class Input {
  private readonly pressedKeys = new Set<string>();
  private pointerDeltaX = 0;
  private pointerDeltaY = 0;

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("blur", this.clearKeys);
    document.addEventListener("mousemove", this.handleMouseMove);
  }

  getPointerDeltaX(): number {
    return this.pointerDeltaX;
  }

  getPointerDeltaY(): number {
    return this.pointerDeltaY;
  }

  isKeyDown(code: string): boolean {
    return this.pressedKeys.has(code);
  }

  dispose(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.clearKeys);
    document.removeEventListener("mousemove", this.handleMouseMove);
  }

  /** @internal */
  resetPointerDelta(): void {
    this.pointerDeltaX = 0;
    this.pointerDeltaY = 0;
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    this.pressedKeys.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  };

  private readonly clearKeys = (): void => {
    this.pressedKeys.clear();
  };

  private readonly handleMouseMove = (event: MouseEvent): void => {
    this.pointerDeltaX += event.movementX;
    this.pointerDeltaY += event.movementY;
  };
}
