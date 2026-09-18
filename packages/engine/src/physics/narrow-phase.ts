import type { Vector3 } from "../math/vector3.ts";

/**
 * Describes the geometric result of a narrow-phase collision test.
 *
 * The normal points away from the second collider and toward the first collider.
 *
 * @privateRemarks
 * This type is kept internal because `World` converts it into the public `Collision`
 * result by attaching the second collider.
 */
export interface CollisionDetails {
  readonly normal: Vector3;
  readonly penetration: number;
}
