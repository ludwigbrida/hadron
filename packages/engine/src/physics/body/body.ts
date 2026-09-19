import { Component } from "../../scene/component.ts";
import type { Scene } from "../../scene/scene.ts";

export abstract class Body extends Component {
  protected override onEnterScene(scene: Scene): void {
    scene.world.addBody(this);
  }

  protected override onExitScene(scene: Scene): void {
    scene.world.removeBody(this);
  }
}
