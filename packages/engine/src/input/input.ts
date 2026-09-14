export class Input {
  private readonly pressedKeys = new Set<string>();
  private readonly addedTabIndex: boolean;
  private pointerDeltaX = 0;
  private pointerDeltaY = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.addedTabIndex = !canvas.hasAttribute("tabindex");

    if (this.addedTabIndex) {
      canvas.tabIndex = 0;
    }

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("blur", this.clearInput);
    canvas.addEventListener("blur", this.clearInput);
    canvas.addEventListener("pointerdown", this.focusCanvas);
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
    window.removeEventListener("blur", this.clearInput);
    this.canvas.removeEventListener("blur", this.clearInput);
    this.canvas.removeEventListener("pointerdown", this.focusCanvas);
    document.removeEventListener("mousemove", this.handleMouseMove);

    if (this.addedTabIndex) {
      this.canvas.removeAttribute("tabindex");
    }
  }

  /** @internal */
  resetPointerDelta(): void {
    this.pointerDeltaX = 0;
    this.pointerDeltaY = 0;
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isActive()) {
      return;
    }

    this.pressedKeys.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  };

  private readonly clearInput = (): void => {
    this.pressedKeys.clear();
    this.resetPointerDelta();
  };

  private readonly focusCanvas = (): void => {
    this.canvas.focus();
  };

  private readonly handleMouseMove = (event: MouseEvent): void => {
    if (
      !this.isActive() ||
      (document.pointerLockElement !== this.canvas && event.target !== this.canvas)
    ) {
      return;
    }

    this.pointerDeltaX += event.movementX;
    this.pointerDeltaY += event.movementY;
  };

  private isActive(): boolean {
    return document.activeElement === this.canvas || document.pointerLockElement === this.canvas;
  }
}
