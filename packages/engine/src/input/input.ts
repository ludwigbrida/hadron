import { ActionMap } from "./action-map.ts";

export class Input {
  private readonly pressedKeys = new Set<string>();
  private readonly justPressedKeys = new Set<string>();
  private readonly justReleasedKeys = new Set<string>();
  private readonly pressedMouseButtons = new Set<number>();
  private readonly justPressedMouseButtons = new Set<number>();
  private readonly justReleasedMouseButtons = new Set<number>();
  private readonly addedTabIndex: boolean;
  private pointerDeltaX = 0;
  private pointerDeltaY = 0;
  private scrollDeltaX = 0;
  private scrollDeltaY = 0;

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
    document.addEventListener("pointerdown", this.handlePointerDown);
    document.addEventListener("pointerup", this.handlePointerUp);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("wheel", this.handleWheel);
  }

  getPointerDeltaX(): number {
    return this.pointerDeltaX;
  }

  getPointerDeltaY(): number {
    return this.pointerDeltaY;
  }

  getScrollDeltaX(): number {
    return this.scrollDeltaX;
  }

  getScrollDeltaY(): number {
    return this.scrollDeltaY;
  }

  isKeyDown(code: string): boolean {
    return this.pressedKeys.has(code);
  }

  wasKeyPressed(code: string): boolean {
    return this.justPressedKeys.has(code);
  }

  wasKeyReleased(code: string): boolean {
    return this.justReleasedKeys.has(code);
  }

  isMouseButtonDown(button: number): boolean {
    return this.pressedMouseButtons.has(button);
  }

  wasMouseButtonPressed(button: number): boolean {
    return this.justPressedMouseButtons.has(button);
  }

  wasMouseButtonReleased(button: number): boolean {
    return this.justReleasedMouseButtons.has(button);
  }

  createActionMap<Action extends string>(): ActionMap<Action> {
    return new ActionMap(this);
  }

  dispose(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.clearInput);
    this.canvas.removeEventListener("blur", this.clearInput);
    this.canvas.removeEventListener("pointerdown", this.focusCanvas);
    document.removeEventListener("pointerdown", this.handlePointerDown);
    document.removeEventListener("pointerup", this.handlePointerUp);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("wheel", this.handleWheel);

    if (this.addedTabIndex) {
      this.canvas.removeAttribute("tabindex");
    }
  }

  /** @internal */
  resetTransientState(): void {
    this.justPressedKeys.clear();
    this.justReleasedKeys.clear();
    this.justPressedMouseButtons.clear();
    this.justReleasedMouseButtons.clear();
    this.pointerDeltaX = 0;
    this.pointerDeltaY = 0;
    this.scrollDeltaX = 0;
    this.scrollDeltaY = 0;
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isActive()) {
      return;
    }

    if (this.pressedKeys.has(event.code)) {
      return;
    }

    this.pressedKeys.add(event.code);
    this.justPressedKeys.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    if (!this.pressedKeys.delete(event.code)) {
      return;
    }

    this.justReleasedKeys.add(event.code);
  };

  private readonly clearInput = (): void => {
    this.pressedKeys.clear();
    this.pressedMouseButtons.clear();
    this.resetTransientState();
  };

  private readonly focusCanvas = (): void => {
    this.canvas.focus();
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (
      !this.isActive() ||
      (document.pointerLockElement !== this.canvas && event.target !== this.canvas) ||
      this.pressedMouseButtons.has(event.button)
    ) {
      return;
    }

    this.pressedMouseButtons.add(event.button);
    this.justPressedMouseButtons.add(event.button);
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (!this.pressedMouseButtons.delete(event.button)) {
      return;
    }

    this.justReleasedMouseButtons.add(event.button);
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

  private readonly handleWheel = (event: WheelEvent): void => {
    if (
      !this.isActive() ||
      (document.pointerLockElement !== this.canvas && event.target !== this.canvas)
    ) {
      return;
    }

    this.scrollDeltaX += event.deltaX;
    this.scrollDeltaY += event.deltaY;
  };

  private isActive(): boolean {
    return document.activeElement === this.canvas || document.pointerLockElement === this.canvas;
  }
}
