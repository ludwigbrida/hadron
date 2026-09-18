import type { Collider } from "../collider.ts";
import type { Collision } from "../collision.ts";

/**
 * Reverses a collision after swapping its query and candidate colliders.
 *
 * The new normal moves the original candidate away from the original query.
 *
 * @param collision The collision produced for the original query and candidate.
 * @param candidate The collider that becomes the candidate after reversing the pair.
 */
export function reverseCollision(collision: Collision, candidate: Collider): Collision {
  return {
    collider: candidate,
    normal: collision.normal.clone().scale(-1),
    penetration: collision.penetration,
  };
}
