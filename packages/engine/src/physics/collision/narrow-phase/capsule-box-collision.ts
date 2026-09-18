import { Vector3 } from "../../../math/vector3.ts";
import type { BoxCollider } from "../../collider/box-collider.ts";
import type { CapsuleCollider } from "../../collider/capsule-collider.ts";
import type { Collision } from "../collision.ts";

/**
 * Computes the contact between an upright capsule and a translated,
 * axis-aligned box.
 *
 * The normal points away from {@link candidate} and toward {@link query}.
 * Touching shapes report a zero-penetration contact.
 *
 * @param query The capsule that will be moved during resolution.
 * @param candidate The box being tested against.
 *
 * @returns The smallest translation that separates {@link query} and {@link candidate},
 * or `undefined` when they do not overlap.
 */
export function capsuleBoxCollision(
  query: CapsuleCollider,
  candidate: BoxCollider,
): Collision | undefined {
  const bounds = candidate.getWorldBounds();
  const center = query.getWorldPosition();

  // The capsule consists of a vertical segment expanded by its radius.
  const segmentMinimumY = center[1] - query.halfSegmentHeight;
  const segmentMaximumY = center[1] + query.halfSegmentHeight;
  let nearestSegmentY: number;

  if (segmentMaximumY < bounds.min[1]) {
    // The entire segment is below the box, so its upper endpoint is nearest.
    nearestSegmentY = segmentMaximumY;
  } else if (segmentMinimumY > bounds.max[1]) {
    // The entire segment is above the box, so its lower endpoint is nearest.
    nearestSegmentY = segmentMinimumY;
  } else {
    // The segment and box overlap vertically. Any shared Y coordinate is nearest.
    nearestSegmentY = Math.max(segmentMinimumY, bounds.min[1]);
  }

  // Clamp the nearest segment point into the box to find the closest point pair.
  const nearestSegmentPoint = new Vector3(center[0], nearestSegmentY, center[2]);
  const nearestBoxPoint = bounds.getClosestPoint(nearestSegmentPoint);
  const offset = nearestSegmentPoint.subtract(nearestBoxPoint);
  const distanceSquared = offset.lengthSquared();

  if (distanceSquared !== 0) {
    // The segment is outside the box. Its radius determines whether the capsule reaches it.
    const distance = Math.sqrt(distanceSquared);

    if (distance > query.radius) {
      return undefined;
    }

    return {
      collider: candidate,
      normal: offset.scale(1 / distance),
      penetration: query.radius - distance,
    };
  }

  // The segment passes through the box. Resolve through its nearest face.
  let normal = new Vector3(-1, 0, 0);
  let penetration = center[0] - bounds.min[0] + query.radius;

  // Compare the upper X face.
  if (bounds.max[0] - center[0] + query.radius < penetration) {
    normal = new Vector3(1, 0, 0);
    penetration = bounds.max[0] - center[0] + query.radius;
  }

  // Compare the lower Y face, including the capsule's lower rounded end.
  if (center[1] + query.halfSegmentHeight + query.radius - bounds.min[1] < penetration) {
    normal = new Vector3(0, -1, 0);
    penetration = center[1] + query.halfSegmentHeight + query.radius - bounds.min[1];
  }

  // Compare the upper Y face, including the capsule's upper rounded end.
  if (bounds.max[1] - center[1] + query.halfSegmentHeight + query.radius < penetration) {
    normal = new Vector3(0, 1, 0);
    penetration = bounds.max[1] - center[1] + query.halfSegmentHeight + query.radius;
  }

  // Compare the upper Z face.
  if (bounds.max[2] - center[2] + query.radius < penetration) {
    normal = new Vector3(0, 0, 1);
    penetration = bounds.max[2] - center[2] + query.radius;
  }

  // Compare the lower Z face.
  if (center[2] - bounds.min[2] + query.radius < penetration) {
    normal = new Vector3(0, 0, -1);
    penetration = center[2] - bounds.min[2] + query.radius;
  }

  return {
    collider: candidate,
    normal,
    penetration,
  };
}
