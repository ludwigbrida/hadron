import type { Collider } from "../../collider/collider.ts";

/**
 * Finds collider pairs that may require narrow-phase collision detection.
 *
 * Broad phase only rejects pairs that cannot overlap. It may yield colliders
 * whose shapes do not actually intersect.
 */
export interface BroadPhase {
  /**
   * Yields colliders that may overlap a query collider.
   *
   * @param query The collider whose potential overlaps are being found.
   * @param colliders The colliders currently registered with the world.
   */
  getCandidates(query: Collider, colliders: Iterable<Collider>): IterableIterator<Collider>;
}
