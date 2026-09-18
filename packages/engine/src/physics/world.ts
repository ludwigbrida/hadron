import { Vector3 } from "../math/vector3.ts";
import { Body } from "./body.ts";
import { BoxCollider } from "./box-collider.ts";
import { CapsuleCollider } from "./capsule-collider.ts";
import { Collider } from "./collider.ts";
import type { Collision } from "./collision.ts";
import { KinematicBody } from "./kinematic-body.ts";
import { boxBoxCollision } from "./narrow-phase/box-box-collision.ts";
import { capsuleBoxCollision } from "./narrow-phase/capsule-box-collision.ts";
import type { CollisionDetails } from "./narrow-phase/collision-details.ts";
import { sphereBoxCollision } from "./narrow-phase/sphere-box-collision.ts";
import { sphereSphereCollision } from "./narrow-phase/sphere-sphere-collision.ts";
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
      return sphereSphereCollision(first, second);
    }

    if (first instanceof BoxCollider && second instanceof SphereCollider) {
      const collision = sphereBoxCollision(second, first);

      if (collision === undefined) {
        return undefined;
      }

      // The narrow phase resolves the sphere, so reverse its normal to resolve the box.
      return {
        normal: collision.normal.clone().scale(-1),
        penetration: collision.penetration,
      };
    }

    if (first instanceof SphereCollider && second instanceof BoxCollider) {
      return sphereBoxCollision(first, second);
    }

    if (first instanceof CapsuleCollider && second instanceof BoxCollider) {
      return capsuleBoxCollision(first, second);
    }

    if (first instanceof BoxCollider && second instanceof CapsuleCollider) {
      const collision = capsuleBoxCollision(second, first);

      if (collision === undefined) {
        return undefined;
      }

      // The narrow phase resolves the capsule, so reverse its normal to resolve the box.
      return {
        normal: collision.normal.clone().scale(-1),
        penetration: collision.penetration,
      };
    }

    return undefined;
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
