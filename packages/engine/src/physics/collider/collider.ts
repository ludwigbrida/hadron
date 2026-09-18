import type { Aabb } from "../../math/aabb.ts";
import { Vector3 } from "../../math/vector3.ts";
import { Node } from "../../scene/node.ts";
import type { Collision } from "../collision/collision.ts";
import type { RaycastHit } from "../query/raycast-hit.ts";
import type { BoxCollider } from "./box-collider.ts";
import type { CapsuleCollider } from "./capsule-collider.ts";
import type { SphereCollider } from "./sphere-collider.ts";

export abstract class Collider extends Node {
  abstract raycast(origin: Readonly<Vector3>, direction: Readonly<Vector3>): RaycastHit | undefined;

  abstract getWorldBounds(): Aabb;

  /**
   * Computes the collision that moves this collider away from a candidate collider.
   *
   * Implementations dispatch to a candidate method specific to their own shape.
   *
   * @param candidate The collider being tested against.
   */
  abstract getCollision(candidate: Collider): Collision | undefined;

  /**
   * Computes the collision for a box query against this collider.
   *
   * @param query The box collider that will be moved during resolution.
   */
  abstract getCollisionWithBox(query: BoxCollider): Collision | undefined;

  /**
   * Computes the collision for a sphere query against this collider.
   *
   * @param query The sphere collider that will be moved during resolution.
   */
  abstract getCollisionWithSphere(query: SphereCollider): Collision | undefined;

  /**
   * Computes the collision for a capsule query against this collider.
   *
   * @param query The capsule collider that will be moved during resolution.
   */
  abstract getCollisionWithCapsule(query: CapsuleCollider): Collision | undefined;

  // TODO: widen this method to parent class
  getWorldPosition(): Vector3 {
    const matrix = this.getWorldMatrix();

    // TODO: realize transform reconstruction through matrix class
    return new Vector3(matrix[12], matrix[13], matrix[14]);
  }
}
