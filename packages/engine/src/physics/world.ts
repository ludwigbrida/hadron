import { Vector3 } from "../math/vector3.ts";
import { Body } from "./body/body.ts";
import { KinematicBody } from "./body/kinematic-body.ts";
import { StaticBody } from "./body/static-body.ts";
import { Collider } from "./collider/collider.ts";
import { BruteForceBroadPhase } from "./collision/broad-phase/brute-force-broad-phase.ts";
import type { Collision } from "./collision/collision.ts";
import type { RaycastHit } from "./query/raycast-hit.ts";

export class World {
  private readonly broadPhase = new BruteForceBroadPhase();
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

    const node = body.owner!;

    node.transform.position.addScaled(displacement, 1);

    for (const collider of node.getComponents(Collider)) {
      for (const collision of this.collisions(collider)) {
        if (!collision.collider.owner?.getComponent(StaticBody)) {
          continue;
        }

        node.transform.position.addScaled(collision.normal, collision.penetration);
        resolvedCollisions.push(collision);
      }
    }

    return resolvedCollisions;
  }

  public *collisions(query: Collider): IterableIterator<Collision> {
    for (const candidate of this.broadPhase.getCandidates(query, this.getColliders())) {
      const collision = query.getCollision(candidate);

      if (collision !== undefined) {
        yield collision;
      }
    }
  }

  *[Symbol.iterator](): IterableIterator<Body> {
    yield* this.bodies;
  }

  *getColliders(): IterableIterator<Collider> {
    for (const body of this.bodies) {
      yield* body.owner!.getComponents(Collider);
    }
  }
}
