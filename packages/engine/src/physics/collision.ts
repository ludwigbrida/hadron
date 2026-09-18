import type { Vector3 } from "../math/vector3.ts";
import type { Collider } from "./collider.ts";

/**
 * Describes an overlap between a queried collider and another collider.
 *
 * The normal points away from the other collider. Moving the queried collider
 * along the normal by the penetration resolves the overlap.
 */
export interface Collision {
  readonly collider: Collider;
  readonly normal: Vector3;
  readonly penetration: number;
}
