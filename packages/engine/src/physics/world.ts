import { Vector3 } from "../math/vector3.ts";
import { Body } from "./body.ts";
import { BoxCollider } from "./box-collider.ts";
import { CapsuleCollider } from "./capsule-collider.ts";
import { Collider } from "./collider.ts";
import type { Collision } from "./collision.ts";
import { KinematicBody } from "./kinematic-body.ts";
import { boxBoxCollision } from "./narrow-phase/box-box-collision.ts";
import type { CollisionDetails } from "./narrow-phase/collision-details.ts";
import type { RaycastHit } from "./raycast-hit.ts";
import { SphereCollider } from "./sphere-collider.ts";
import { StaticBody } from "./static-body.ts";

export class World {
  private readonly bodies = new Set<Body>();

  public addBody(body: Body): this {
    this.bodies.add(body);
    return this;
  }

  public removeBody(body: Body): this {
    this.bodies.delete(body);
    return this;
  }

  /**
   * Returns the nearest collider hit by a normalized ray.
   */
  public raycast(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
    maxDistance: number,
  ): RaycastHit | undefined {
    let nearestHit: RaycastHit | undefined;

    for (const collider of this.getColliders()) {
      const hit = collider.raycast(origin, direction);

      if (
        hit !== undefined &&
        hit.distance <= maxDistance &&
        (nearestHit === undefined || hit.distance < nearestHit.distance)
      ) {
        nearestHit = hit;
      }
    }

    return nearestHit;
  }

  public *overlaps(collider: Collider): IterableIterator<Collider> {
    for (const collision of this.collisions(collider)) {
      yield collision.collider;
    }
  }

  /**
   * Moves a kinematic body and resolves its overlaps with static bodies.
   *
   * For now, this is a discrete movement operation and can miss thin colliders when
   * the requested displacement is large.
   */
  public moveAndResolve(body: KinematicBody, displacement: Readonly<Vector3>): Collision[] {
    const resolvedCollisions: Collision[] = [];

    body.transform.position.addScaled(displacement, 1);

    for (const child of body) {
      if (!(child instanceof Collider)) {
        continue;
      }

      for (const collision of this.collisions(child)) {
        if (!(collision.collider.parent instanceof StaticBody)) {
          continue;
        }

        body.transform.position.addScaled(collision.normal, collision.penetration);
        resolvedCollisions.push(collision);
      }
    }

    return resolvedCollisions;
  }

  public *collisions(collider: Collider): IterableIterator<Collision> {
    for (const other of this.getColliders()) {
      // Colliders on the same body form a compound shape, not a collision pair.
      if (
        other === collider ||
        (collider.parent !== undefined && other.parent === collider.parent) ||
        !this.hasOverlappingBounds(collider, other)
      ) {
        continue;
      }

      const collision = this.getCollision(collider, other);

      if (collision !== undefined) {
        yield {
          collider: other,
          normal: collision.normal,
          penetration: collision.penetration,
        };
      }
    }
  }

  private getCollision(first: Collider, second: Collider): CollisionDetails | undefined {
    if (first instanceof BoxCollider && second instanceof BoxCollider) {
      return boxBoxCollision(first, second);
    }

    if (first instanceof SphereCollider && second instanceof SphereCollider) {
      return this.spheresCollision(first, second);
    }

    if (first instanceof BoxCollider && second instanceof SphereCollider) {
      const collision = this.boxAndSphereCollision(first, second);

      if (collision === undefined) {
        return undefined;
      }

      return {
        normal: new Vector3(-collision.normal[0], -collision.normal[1], -collision.normal[2]),
        penetration: collision.penetration,
      };
    }

    if (first instanceof SphereCollider && second instanceof BoxCollider) {
      return this.boxAndSphereCollision(second, first);
    }

    if (first instanceof CapsuleCollider && second instanceof BoxCollider) {
      return this.capsuleAndBoxCollision(first, second);
    }

    if (first instanceof BoxCollider && second instanceof CapsuleCollider) {
      const collision = this.capsuleAndBoxCollision(second, first);

      if (collision === undefined) {
        return undefined;
      }

      return {
        normal: new Vector3(-collision.normal[0], -collision.normal[1], -collision.normal[2]),
        penetration: collision.penetration,
      };
    }

    return undefined;
  }

  private spheresCollision(first: SphereCollider, second: SphereCollider): CollisionDetails {
    const offset = first.getWorldPosition().subtract(second.getWorldPosition());
    const radius = first.radius + second.radius;
    const distanceSquared = offset.lengthSquared();

    if (distanceSquared === 0) {
      // Coincident centers have no geometric separation direction.
      return {
        normal: new Vector3(1, 0, 0),
        penetration: radius,
      };
    }

    const distance = Math.sqrt(distanceSquared);

    return {
      normal: offset.addScaled(offset, 1 / distance - 1),
      penetration: radius - distance,
    };
  }

  private boxAndSphereCollision(
    box: BoxCollider,
    sphere: SphereCollider,
  ): CollisionDetails | undefined {
    const bounds = box.getWorldBounds();
    const center = sphere.getWorldPosition();

    const closestPoint = new Vector3(
      Math.max(bounds.min[0], Math.min(center[0], bounds.max[0])),
      Math.max(bounds.min[1], Math.min(center[1], bounds.max[1])),
      Math.max(bounds.min[2], Math.min(center[2], bounds.max[2])),
    );

    const offset = center.clone().subtract(closestPoint);
    const distanceSquared = offset.lengthSquared();

    if (distanceSquared !== 0) {
      const distance = Math.sqrt(distanceSquared);

      if (distance > sphere.radius) {
        return undefined;
      }

      return {
        normal: offset.addScaled(offset, 1 / distance - 1),
        penetration: sphere.radius - distance,
      };
    }

    let normal = new Vector3(-1, 0, 0);
    let faceDistance = center[0] - bounds.min[0];

    if (bounds.max[0] - center[0] < faceDistance) {
      normal = new Vector3(1, 0, 0);
      faceDistance = bounds.max[0] - center[0];
    }

    if (center[1] - bounds.min[1] < faceDistance) {
      normal = new Vector3(0, -1, 0);
      faceDistance = center[1] - bounds.min[1];
    }

    if (bounds.max[1] - center[1] < faceDistance) {
      normal = new Vector3(0, 1, 0);
      faceDistance = bounds.max[1] - center[1];
    }

    if (center[2] - bounds.min[2] < faceDistance) {
      normal = new Vector3(0, 0, -1);
      faceDistance = center[2] - bounds.min[2];
    }

    if (bounds.max[2] - center[2] < faceDistance) {
      normal = new Vector3(0, 0, 1);
      faceDistance = bounds.max[2] - center[2];
    }

    return {
      normal,
      penetration: sphere.radius + faceDistance,
    };
  }

  private capsuleAndBoxCollision(
    capsule: CapsuleCollider,
    box: BoxCollider,
  ): CollisionDetails | undefined {
    const bounds = box.getWorldBounds();
    const center = capsule.getWorldPosition();
    const segmentMinimumY = center[1] - capsule.halfSegmentHeight;
    const segmentMaximumY = center[1] + capsule.halfSegmentHeight;
    let capsuleY: number;
    let boxY: number;

    if (segmentMaximumY < bounds.min[1]) {
      capsuleY = segmentMaximumY;
      boxY = bounds.min[1];
    } else if (segmentMinimumY > bounds.max[1]) {
      capsuleY = segmentMinimumY;
      boxY = bounds.max[1];
    } else {
      capsuleY = Math.max(segmentMinimumY, bounds.min[1]);
      boxY = capsuleY;
    }

    const closestPoint = new Vector3(
      Math.max(bounds.min[0], Math.min(center[0], bounds.max[0])),
      boxY,
      Math.max(bounds.min[2], Math.min(center[2], bounds.max[2])),
    );
    const offset = new Vector3(center[0], capsuleY, center[2]).subtract(closestPoint);
    const distanceSquared = offset.lengthSquared();

    if (distanceSquared !== 0) {
      const distance = Math.sqrt(distanceSquared);

      if (distance > capsule.radius) {
        return undefined;
      }

      return {
        normal: offset.addScaled(offset, 1 / distance - 1),
        penetration: capsule.radius - distance,
      };
    }

    let normal = new Vector3(-1, 0, 0);
    let penetration = bounds.max[0] - center[0] + capsule.radius;

    if (center[0] - bounds.min[0] + capsule.radius < penetration) {
      normal = new Vector3(1, 0, 0);
      penetration = center[0] - bounds.min[0] + capsule.radius;
    }

    if (center[1] + capsule.halfSegmentHeight + capsule.radius - bounds.min[1] < penetration) {
      normal = new Vector3(0, -1, 0);
      penetration = center[1] + capsule.halfSegmentHeight + capsule.radius - bounds.min[1];
    }

    if (bounds.max[1] - center[1] + capsule.halfSegmentHeight + capsule.radius < penetration) {
      normal = new Vector3(0, 1, 0);
      penetration = bounds.max[1] - center[1] + capsule.halfSegmentHeight + capsule.radius;
    }

    if (bounds.max[2] - center[2] + capsule.radius < penetration) {
      normal = new Vector3(0, 0, -1);
      penetration = bounds.max[2] - center[2] + capsule.radius;
    }

    if (center[2] - bounds.min[2] + capsule.radius < penetration) {
      normal = new Vector3(0, 0, 1);
      penetration = center[2] - bounds.min[2] + capsule.radius;
    }

    return { normal, penetration };
  }

  private hasOverlappingBounds(first: Collider, second: Collider): boolean {
    return first.getWorldBounds().overlaps(second.getWorldBounds());
  }

  *[Symbol.iterator](): IterableIterator<Body> {
    yield* this.bodies;
  }

  *getColliders(): IterableIterator<Collider> {
    for (const body of this.bodies) {
      for (const child of body) {
        if (child instanceof Collider) {
          yield child;
        }
      }
    }
  }
}
