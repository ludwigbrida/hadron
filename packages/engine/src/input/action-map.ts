import type { Input } from "./input.ts";

export interface KeyActionBinding {
  readonly code: string;
}

export class ActionMap<Action extends string> {
  private readonly actionBindings = new Map<Action, readonly KeyActionBinding[]>();

  constructor(private readonly input: Input) {}

  bindAction(action: Action, bindings: readonly KeyActionBinding[]): void {
    this.actionBindings.set(action, bindings);
  }

  isActionDown(action: Action): boolean {
    return this.actionBindings.get(action)?.some(({ code }) => this.input.isKeyDown(code)) ?? false;
  }
}
