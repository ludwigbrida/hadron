import type { InputControl } from "./input-control.ts";
import type { Input } from "./input.ts";

export type ActionEnum = Record<string, string | number>;

export type ActionValue<Actions extends ActionEnum> = Actions[Extract<keyof Actions, string>];

export interface AxisBinding {
  readonly negative: InputControl;
  readonly positive: InputControl;
}

export class ActionMap<Action extends string | number> {
  private readonly actionBindings = new Map<Action, readonly InputControl[]>();
  private readonly axisBindings = new Map<Action, AxisBinding>();

  constructor(private readonly input: Input) {}

  bindAction(action: Action, controls: readonly InputControl[]): void {
    this.actionBindings.set(action, controls);
  }

  bindAxis(action: Action, binding: AxisBinding): void {
    this.axisBindings.set(action, binding);
  }

  getAxis(action: Action): number {
    const binding = this.axisBindings.get(action);

    if (binding === undefined) {
      return 0;
    }

    return (
      Number(this.isControlDown(binding.positive)) - Number(this.isControlDown(binding.negative))
    );
  }

  isActionDown(action: Action): boolean {
    return this.actionBindings.get(action)?.some(this.isControlDown) ?? false;
  }

  wasActionPressed(action: Action): boolean {
    const controls = this.actionBindings.get(action);

    if (controls === undefined) {
      return false;
    }

    return (
      controls.some((control) => this.isControlDown(control) && this.wasControlPressed(control)) &&
      !controls.some((control) => this.isControlDown(control) && !this.wasControlPressed(control))
    );
  }

  wasActionReleased(action: Action): boolean {
    const controls = this.actionBindings.get(action);

    if (controls === undefined) {
      return false;
    }

    return (
      !controls.some(this.isControlDown) &&
      controls.some(
        (control) => this.wasControlReleased(control) && !this.wasControlPressed(control),
      )
    );
  }

  private readonly isControlDown = (control: InputControl): boolean => {
    return typeof control === "string"
      ? this.input.isKeyDown(control)
      : this.input.isMouseButtonDown(control);
  };

  private readonly wasControlPressed = (control: InputControl): boolean => {
    return typeof control === "string"
      ? this.input.wasKeyPressed(control)
      : this.input.wasMouseButtonPressed(control);
  };

  private readonly wasControlReleased = (control: InputControl): boolean => {
    return typeof control === "string"
      ? this.input.wasKeyReleased(control)
      : this.input.wasMouseButtonReleased(control);
  };
}
