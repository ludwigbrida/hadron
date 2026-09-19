import {
  CapsuleCollider,
  KeyboardKey,
  Vector3,
  type ActionMap,
  type Collision,
  type Input,
  type Scene,
} from "@hadron/engine";

enum PlayerAction {
  MoveForward,
  MoveRight,
  Jump,
}

/**
 * Implements the sandbox's first-person input, movement, and camera behavior.
 */
export class PlayerController {
  private static readonly gravity = -12;
  private static readonly jumpSpeed = 5;
  private static readonly moveSpeed = 2;
  private static readonly mouseSensitivity = 0.002;
  private static readonly eyeHeight = 1.5;

  private readonly actions: ActionMap<PlayerAction>;
  private readonly body;
  private readonly bodyNode;
  private readonly displacement = new Vector3();
  private yaw = -Math.PI / 2;
  private pitch = Math.atan2(-0.5, 3);
  private verticalVelocity = 0;
  private isGrounded = true;

  constructor(
    private readonly scene: Scene,
    private readonly input: Input,
  ) {
    this.actions = input.createActionMap<typeof PlayerAction>();
    this.actions.bindAxis(PlayerAction.MoveForward, {
      negative: KeyboardKey.S,
      positive: KeyboardKey.W,
    });
    this.actions.bindAxis(PlayerAction.MoveRight, {
      negative: KeyboardKey.A,
      positive: KeyboardKey.D,
    });
    this.actions.bindAction(PlayerAction.Jump, [KeyboardKey.Space]);

    this.body = scene.createKinematicBody();
    this.bodyNode = scene.createNode();
    this.bodyNode.addComponent(this.body);
    this.bodyNode.addComponent(new CapsuleCollider({ radius: 0.3, height: 3 }));
    scene.root.addChild(this.bodyNode);

    // The sandbox ground's top surface is at Y = -1.
    this.bodyNode.transform.position.setXyz(0, -1 + PlayerController.eyeHeight, 1);
    const cameraNode = scene.createNode();
    cameraNode.addComponent(scene.camera);
    this.bodyNode.addChild(cameraNode);

    cameraNode.transform.rotation.setXyz(this.pitch, -this.yaw - Math.PI / 2, 0);
    scene.camera.setPerspective(Math.PI / 3, 0.1, 100);
  }

  public update(deltaTime: number): void {
    if (!this.input.isPointerLocked()) {
      return;
    }

    this.updateLook();
    this.updateMovement(deltaTime);
    this.scene.camera.owner!.transform.rotation.setXyz(this.pitch, -this.yaw - Math.PI / 2, 0);
  }

  private updateLook(): void {
    this.yaw += this.input.getPointerDeltaX() * PlayerController.mouseSensitivity;
    this.pitch = Math.max(
      -Math.PI / 2 + 0.01,
      Math.min(
        Math.PI / 2 - 0.01,
        this.pitch - this.input.getPointerDeltaY() * PlayerController.mouseSensitivity,
      ),
    );
  }

  private updateMovement(deltaTime: number): void {
    const forwardX = Math.cos(this.yaw);
    const forwardZ = Math.sin(this.yaw);
    const rightX = -forwardZ;
    const rightZ = forwardX;
    const forward = this.actions.getAxis(PlayerAction.MoveForward);
    const right = this.actions.getAxis(PlayerAction.MoveRight);
    const inputLength = Math.hypot(forward, right);
    const movementDistance =
      inputLength === 0 ? 0 : (deltaTime * PlayerController.moveSpeed) / inputLength;

    if (this.isGrounded && this.actions.wasActionPressed(PlayerAction.Jump)) {
      this.verticalVelocity = PlayerController.jumpSpeed;
      this.isGrounded = false;
    }

    this.verticalVelocity += PlayerController.gravity * deltaTime;
    this.displacement.setXyz(
      (forwardX * forward + rightX * right) * movementDistance,
      this.verticalVelocity * deltaTime,
      (forwardZ * forward + rightZ * right) * movementDistance,
    );

    this.updateGrounding(this.scene.world.moveAndResolve(this.body, this.displacement));
  }

  private updateGrounding(collisions: readonly Collision[]): void {
    this.isGrounded = false;

    for (const collision of collisions) {
      if (collision.normal[1] > 0 && this.verticalVelocity <= 0) {
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }

      if (collision.normal[1] < 0 && this.verticalVelocity > 0) {
        this.verticalVelocity = 0;
      }
    }
  }
}
