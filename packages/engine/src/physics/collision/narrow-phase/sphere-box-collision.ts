import { Vector3 } from "../../../math/vector3.ts";
import type { BoxCollider } from "../../collider/box-collider.ts";
import type { SphereCollider } from "../../collider/sphere-collider.ts";
import type { Collision } from "../collision.ts";

/**
 * Computes the contact between a sphere and a translated, axis-aligned box.
 *
 * The normal points away from {@link candidate} and toward {@link query}.
 * Touching shapes report a zero-penetration contact.
 *
 * @param query The sphere that will be moved during resolution.
 * @param candidate The box being tested against.
 *
 * @returns The smallest translation that separates {@link query} and {@link candidate},
 * or `undefined` when they do not overlap.
 */
export function sphereBoxCollision(
  query: SphereCollider,
  candidate: BoxCollider,
): Collision | undefined {
  // Find the point inside the box nearest to the sphere's center.
  const bounds = candidate.getWorldBounds();
  const center = query.getWorldPosition();
  const closestPoint = bounds.getClosestPoint(center);

  // This offset points away from the box toward the sphere.
  const centerOffset = center.clone().subtract(closestPoint);
  const distanceSquared = centerOffset.lengthSquared();

  if (distanceSquared !== 0) {
    // A center outside the box intersects only when it lies within the sphere radius.
    const distance = Math.sqrt(distanceSquared);

    if (distance > query.radius) {
      return undefined;
    }

    return {
      collider: candidate,
      normal: centerOffset.scale(1 / distance),
      penetration: query.radius - distance,
    };
  }

  // The sphere center lies inside the box. Resolve through its nearest face.
  let normal = new Vector3(-1, 0, 0);
  let faceDistance = center[0] - bounds.min[0];

  // Consider the opposing X face.
  if (bounds.max[0] - center[0] < faceDistance) {
    normal = new Vector3(1, 0, 0);
    faceDistance = bounds.max[0] - center[0];
  }

  // Consider both Y faces.
  if (center[1] - bounds.min[1] < faceDistance) {
    normal = new Vector3(0, -1, 0);
    faceDistance = center[1] - bounds.min[1];
  }

  if (bounds.max[1] - center[1] < faceDistance) {
    normal = new Vector3(0, 1, 0);
    faceDistance = bounds.max[1] - center[1];
  }

  // Consider both Z faces.
  if (center[2] - bounds.min[2] < faceDistance) {
    normal = new Vector3(0, 0, -1);
    faceDistance = center[2] - bounds.min[2];
  }

  if (bounds.max[2] - center[2] < faceDistance) {
    normal = new Vector3(0, 0, 1);
    faceDistance = bounds.max[2] - center[2];
  }

  return {
    collider: candidate,
    normal,
    // Move the center to the nearest face, then move the sphere radius beyond it.
    penetration: faceDistance + query.radius,
  };
}
