import { Script, type Frame, type Node } from "@hadron/engine";

/** Animates the two cube nodes around their shared parent. */
export class RotatingCubes extends Script {
  public constructor(
    private readonly first: Node,
    private readonly second: Node,
  ) {
    super();
  }

  public override update(frame: Frame): void {
    const { elapsedTime } = frame;

    this.first.transform.rotation.setXyz(elapsedTime / 1.5, elapsedTime, elapsedTime / 2);
    this.second.transform.rotation.setXyz(-elapsedTime / 1.2, -elapsedTime / 2, -elapsedTime / 1.5);
    this.owner!.transform.rotation.setXyz(0, elapsedTime / 4, 0);
  }
}
