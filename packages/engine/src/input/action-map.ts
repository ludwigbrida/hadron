import type { InputControl } from "./input-control.ts";
import type { Input } from "./input.ts";

export type ActionEnum = Record<string, string | number>;

export type ActionValue<Actions extends ActionEnum> = Actions[Extract<keyof Actions, string>];

export class ActionMap<Action extends string | number> {
  private readonly actionBindings = new Map<Action, readonly InputControl[]>();

  constructor(private readonly input: Input) {}

  bindAction(action: Action, controls: readonly InputControl[]): void {
    this.actionBindings.set(action, controls);
  }

  isActionDown(action: Action): boolean {
    return (
      this.actionBindings
        .get(action)
        ?.some((control) =>
          typeof control === "string"
            ? this.input.isKeyDown(control)
            : this.input.isMouseButtonDown(control),
        ) ?? false
    );
  }
}
