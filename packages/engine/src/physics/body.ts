import { Node } from "../scene/node.ts";
import { BoxCollider, type BoxColliderOptions } from "./box-collider.ts";

export abstract class Body extends Node {
  createBoxCollider(options: Readonly<BoxColliderOptions>): BoxCollider {
    const collider = new BoxCollider(options);

    this.addChild(collider);
    return collider;
  }
}
