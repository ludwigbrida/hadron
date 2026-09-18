import { Vector3 } from "../math/vector3.ts";
import { Body } from "./body.ts";
import { BoxCollider } from "./box-collider.ts";
import { CapsuleCollider } from "./capsule-collider.ts";
import { Collider } from "./collider.ts";
import type { Collision } from "./collision.ts";
import { KinematicBody } from "./kinematic-body.ts";
import { boxBoxCollision } from "./narrow-phase/box-box-collision.ts";
import { capsuleBoxCollision } from "./narrow-phase/capsule-box-collision.ts";
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

  public *collisions(query: Collider): IterableIterator<Collision> {
    for (const candidate of this.getColliders()) {
      // Colliders on the same body form a compound shape, not a collision pair.
      if (
        candidate === query ||
        (query.parent !== undefined && candidate.parent === query.parent) ||
        !this.hasOverlappingBounds(query, candidate)
      ) {
        continue;
      }

      const collision = this.getCollision(query, candidate);

      if (collision !== undefined) {
        yield collision;
      }
    }
  }

  private getCollision(query: Collider, candidate: Collider): Collision | undefined {
    if (query instanceof BoxCollider && candidate instanceof BoxCollider) {
      return boxBoxCollision(query, candidate);
    }

    if (query instanceof SphereCollider && candidate instanceof SphereCollider) {
      return sphereSphereCollision(query, candidate);
    }

    if (query instanceof BoxCollider && candidate instanceof SphereCollider) {
      const collision = sphereBoxCollision(candidate, query);

      if (collision === undefined) {
        return undefined;
      }

      // The narrow phase resolves the sphere, so reverse its normal to resolve the box.
      return {
        collider: candidate,
        normal: collision.normal.clone().scale(-1),
        penetration: collision.penetration,
      };
    }

    if (query instanceof SphereCollider && candidate instanceof BoxCollider) {
      return sphereBoxCollision(query, candidate);
    }

    if (query instanceof CapsuleCollider && candidate instanceof BoxCollider) {
      return capsuleBoxCollision(query, candidate);
    }

    if (query instanceof BoxCollider && candidate instanceof CapsuleCollider) {
      const collision = capsuleBoxCollision(candidate, query);

      if (collision === undefined) {
        return undefined;
      }

      // The narrow phase resolves the capsule, so reverse its normal to resolve the box.
      return {
        collider: candidate,
        normal: collision.normal.clone().scale(-1),
        penetration: collision.penetration,
      };
    }

    return undefined;
  }

  private hasOverlappingBounds(query: Collider, candidate: Collider): boolean {
    return query.getWorldBounds().overlaps(candidate.getWorldBounds());
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
