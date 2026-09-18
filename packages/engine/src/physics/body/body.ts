import { Node } from "../../scene/node.ts";
import { BoxCollider, type BoxColliderOptions } from "../collider/box-collider.ts";
import { CapsuleCollider, type CapsuleColliderOptions } from "../collider/capsule-collider.ts";
import { SphereCollider, type SphereColliderOptions } from "../collider/sphere-collider.ts";

export abstract class Body extends Node {
  createBoxCollider(options: Readonly<BoxColliderOptions>): BoxCollider {
    const collider = new BoxCollider(options);

    this.addChild(collider);
    return collider;
  }

  createCapsuleCollider(options: Readonly<CapsuleColliderOptions>): CapsuleCollider {
    const collider = new CapsuleCollider(options);

    this.addChild(collider);
    return collider;
  }

  createSphereCollider(options: Readonly<SphereColliderOptions>): SphereCollider {
    const collider = new SphereCollider(options);

    this.addChild(collider);
    return collider;
  }
}
