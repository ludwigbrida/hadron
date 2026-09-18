import { Vector3 } from "../../math/vector3.ts";
import type { BoxCollider } from "../box-collider.ts";
import type { Collision } from "../collision.ts";

/**
 * Computes the contact between two axis-aligned box colliders.
 * TODO: widen to all transformations
 *
 * This resolver relies on broad-phase bounds rejection to confirm that the
 * boxes overlap.
 *
 * @param query The collider that will be moved during resolution.
 * @param candidate The collider being tested against.
 *
 * @returns The smallest translation that separates the two boxes.
 * The normal points away from {@link candidate} and toward {@link query}.
 */
export function boxBoxCollision(query: BoxCollider, candidate: BoxCollider): Collision {
  // Read the already-transformed axis-aligned bounds for both colliders.
  const queryBounds = query.getWorldBounds();
  const candidateBounds = candidate.getWorldBounds();

  // The intersection begins at the larger lower bound on each axis.
  const overlapMinimum = queryBounds.minimum.clone().max(candidateBounds.minimum);

  // The intersection ends at the smaller upper bound on each axis.
  const overlapMaximum = queryBounds.maximum.clone().min(candidateBounds.maximum);

  // Their component-wise difference is the overlap along each axis.
  const overlap = overlapMaximum.subtract(overlapMinimum);

  // Resolve on the axis that requires the least movement.
  const axis = overlap.minAxis();

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
