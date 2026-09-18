import { Vector3 } from "../../math/vector3.ts";
import type { BoxCollider } from "../box-collider.ts";
import type { Collision } from "../collision.ts";

/**
 * Computes the contact between two translated, axis-aligned box colliders.
 * TODO: widen to all transformations, not only translated boxes
 *
 * The normal points away from {@link candidate} and toward {@link query}.
 * Touching boxes report a zero-penetration contact.
 *
 * @param query The collider that will be moved during resolution.
 * @param candidate The collider being tested against.
 *
 * @returns The smallest translation that separates {@link query} and {@link candidate} or
 * `undefined` when they do not overlap.
 */
export function boxBoxCollision(query: BoxCollider, candidate: BoxCollider): Collision | undefined {
  // Read the transformed bounds and let Aabb compute their overlap per axis.
  const overlap = query.getWorldBounds().getOverlap(candidate.getWorldBounds());

  // Resolve on the axis that requires the least movement.
  const axis = overlap.minAxis();

  // A negative minimum means the boxes are separated on at least one axis.
  if (overlap[axis] < 0) {
    return undefined;
  }

  // Compare centers to choose the direction that moves `query` away from `candidate`.
  const queryCenter = query.getWorldPosition();
  const candidateCenter = candidate.getWorldPosition();

  // Points away from the candidate on the axis that requires the smallest separating movement.
  const normal = new Vector3();
  normal[axis] = queryCenter[axis] < candidateCenter[axis] ? -1 : 1;

  // The intersection size on the chosen axis is also the penetration distance.
  const penetration = overlap[axis];

  return {
    collider: candidate,
    normal,
    penetration,
  };
}
