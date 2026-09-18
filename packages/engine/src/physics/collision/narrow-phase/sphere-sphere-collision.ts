import { Vector3 } from "../../../math/vector3.ts";
import type { SphereCollider } from "../../collider/sphere-collider.ts";
import type { Collision } from "../collision.ts";

export function sphereSphereCollision(
  query: SphereCollider,
  candidate: SphereCollider,
): Collision | undefined {
  // Find the vector from the candidate center to the query center.
  const centerOffset = query.getWorldPosition().subtract(candidate.getWorldPosition());

  const combinedRadius = query.radius + candidate.radius;
  const distanceSquared = centerOffset.lengthSquared();

  // Two spheres intersect when their center distance is not greater than the
  // sum of their radii.
  if (distanceSquared > combinedRadius * combinedRadius) {
    return undefined;
  }

  // Coinciding centers have no geometric separating direction,
  // so choose an arbitrary stable axis to keep resolution deterministic.
  if (distanceSquared === 0) {
    return {
      collider: candidate,
      normal: new Vector3(1, 0, 0),
      penetration: combinedRadius,
    };
  }

  const distance = Math.sqrt(distanceSquared);
  const normal = centerOffset.scale(1 / distance);

  // The unshared part of the combined radii is the separating distance.
  const penetration = combinedRadius - distance;

  return {
    collider: candidate,
    normal,
    penetration,
  };
}
