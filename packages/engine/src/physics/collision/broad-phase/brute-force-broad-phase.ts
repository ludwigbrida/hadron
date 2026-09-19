import type { Collider } from "../../collider/collider.ts";
import type { BroadPhase } from "./broad-phase.ts";

/**
 * Finds broad-phase candidates by comparing every collider's world bounds.
 *
 * @privateRemarks
 * This method has quadratic cost across a worldwide collision pass. It provides a
 * correct baseline that can later be replaced by a spatial index.
 */
export class BruteForceBroadPhase implements BroadPhase {
  public *getCandidates(
    query: Collider,
    colliders: Iterable<Collider>,
  ): IterableIterator<Collider> {
    // The query bounds remain unchanged for the duration of one candidate search.
    const queryBounds = query.getWorldBounds();

    for (const candidate of colliders) {
      // A collider cannot collide with itself. Colliders on one body form a
      // compound shape and therefore are not treated as a collision pair.
      if (candidate === query || (query.owner !== undefined && candidate.owner === query.owner)) {
        continue;
      }

      // AABB separation proves the shapes cannot overlap, so narrow phase is unnecessary.
      if (!queryBounds.overlaps(candidate.getWorldBounds())) {
        continue;
      }

      yield candidate;
    }
  }
}
