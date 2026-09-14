import type { Input } from "./input.ts";

export interface KeyActionBinding {
  readonly code: string;
}

export interface MouseButtonActionBinding {
  readonly button: number;
}

export type ActionBinding = KeyActionBinding | MouseButtonActionBinding;

export class ActionMap<Action extends string> {
  private readonly actionBindings = new Map<Action, readonly ActionBinding[]>();

  constructor(private readonly input: Input) {}

  bindAction(action: Action, bindings: readonly ActionBinding[]): void {
    this.actionBindings.set(action, bindings);
  }

  isActionDown(action: Action): boolean {
    return (
      this.actionBindings
        .get(action)
        ?.some((binding) =>
          "code" in binding
            ? this.input.isKeyDown(binding.code)
            : this.input.isMouseButtonDown(binding.button),
        ) ?? false
    );
  }
}
