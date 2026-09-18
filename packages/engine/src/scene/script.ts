import type { Frame } from "../core/engine.ts";
import { Component } from "./component.ts";

export abstract class Script extends Component {
  public update(_frame: Frame): void {}
}
