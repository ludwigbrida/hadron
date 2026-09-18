import { Color, Engine, KeyboardKey, Vector3, type Frame } from "@hadron/engine";
import { loadCubeTexture, loadTexture } from "./assets/load-texture.ts";
import "./main.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const engine = await Engine.create(canvas);

enum PlayerAction {
  MoveForward,
  MoveRight,
  Jump,
}

const playerInput = engine.input.createActionMap<typeof PlayerAction>();
playerInput.bindAxis(PlayerAction.MoveForward, {
  negative: KeyboardKey.S,
  positive: KeyboardKey.W,
});
playerInput.bindAxis(PlayerAction.MoveRight, {
  negative: KeyboardKey.A,
  positive: KeyboardKey.D,
});
playerInput.bindAction(PlayerAction.Jump, [KeyboardKey.Space]);

const groundTexture = await loadTexture(engine, "/assets/stone.png", {
  addressModeU: "repeat",
  addressModeV: "repeat",
});
const skyTexture = await loadCubeTexture(engine, {
  positiveX: "/assets/sky/positive-x.png",
  negativeX: "/assets/sky/negative-x.png",
  positiveY: "/assets/sky/positive-y.png",
  negativeY: "/assets/sky/negative-y.png",
  positiveZ: "/assets/sky/positive-z.png",
  negativeZ: "/assets/sky/negative-z.png",
});

const cube = engine.createGeometry({
  positions: new Float32Array([
    // front
    -0.25, -0.25, 0.25, 0.25, -0.25, 0.25, 0.25, 0.25, 0.25, -0.25, 0.25, 0.25,
    // back
    0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25, 0.25, -0.25, 0.25, 0.25, -0.25,
    // left
    -0.25, -0.25, -0.25, -0.25, -0.25, 0.25, -0.25, 0.25, 0.25, -0.25, 0.25, -0.25,
    // right
    0.25, -0.25, 0.25, 0.25, -0.25, -0.25, 0.25, 0.25, -0.25, 0.25, 0.25, 0.25,
    // bottom
    -0.25, -0.25, -0.25, 0.25, -0.25, -0.25, 0.25, -0.25, 0.25, -0.25, -0.25, 0.25,
    // top
    -0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, -0.25, -0.25, 0.25, -0.25,
  ]),
  normals: new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, -1, 0, 0, -1, 0, 0,
    -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
  ]),
  texCoords: new Float32Array([
    0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1,
  ]),
  indices: new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16,
    18, 19, 20, 21, 22, 20, 22, 23,
  ]),
});

const ground = engine.createGeometry({
  positions: new Float32Array([-10, -1, -10, 10, -1, -10, 10, -1, 10, -10, -1, 10]),
  normals: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
  texCoords: new Float32Array([0, 0, 10, 0, 10, 10, 0, 10]),
  indices: new Uint16Array([0, 2, 1, 0, 3, 2]),
});

const scene = engine.createScene();
const directionalLight = scene.createDirectionalLight();
scene.setSky(skyTexture);
const blueMaterial = engine.createMaterial(new Color(0.2, 0.7, 1));
const redMaterial = engine.createMaterial(new Color(1, 0.3, 0.2));
const groundMaterial = engine.createMaterial(new Color(1, 1, 1), {
  baseColorTexture: groundTexture,
});
const firstMesh = scene.createMesh(cube, blueMaterial);
const secondMesh = scene.createMesh(cube, redMaterial);
scene.createMesh(ground, groundMaterial);
const platform = scene.createMesh(cube, groundMaterial);
const wall = scene.createMesh(cube, groundMaterial);
const cubeGroup = scene.createNode();
const groundBody = scene.createStaticBody();
const platformBody = scene.createStaticBody();
const wallBody = scene.createStaticBody();
const player = scene.createKinematicBody();

firstMesh.transform.position.setXyz(0.5, 0, -2);
firstMesh.transform.scale.setXyz(1, 1.5, 1);
secondMesh.transform.position.setXyz(-0.5, 0, -2);
secondMesh.transform.scale.setXyz(1.5, 1, 1);
groundBody.transform.position.setXyz(0, -1.25, 0);
groundBody.createBoxCollider({ halfExtents: new Vector3(10, 0.25, 10) });
platformBody.transform.position.setXyz(0, -0.75, -4);
platform.transform.scale.setXyz(8, 1, 8);
platformBody.addChild(platform);
platformBody.createBoxCollider({ halfExtents: new Vector3(2, 0.25, 2) });
wallBody.transform.position.setXyz(0, 1, -6);
wall.transform.scale.setXyz(16, 8, 1);
wallBody.addChild(wall);
wallBody.createBoxCollider({ halfExtents: new Vector3(4, 2, 0.25) });
player.createBoxCollider({ halfExtents: new Vector3(0.3, 1.5, 0.3) });
player.addChild(scene.camera);
cubeGroup.addChild(firstMesh).addChild(secondMesh);

directionalLight.transform.rotation.setXyz(-0.62, 0.46, 0);

const playerPosition = player.transform.position;
const groundHeight = -1;
const playerEyeHeight = 1.5;
const gravity = -12;
const jumpSpeed = 5;
let cameraYaw = -Math.PI / 2;
let cameraPitch = Math.atan2(-0.5, 3);
let verticalVelocity = 0;
let isGrounded = true;

playerPosition.setXyz(0, groundHeight + playerEyeHeight, 1);
scene.camera.transform.rotation.setXyz(cameraPitch, -cameraYaw - Math.PI / 2, 0);
scene.camera.setPerspective(Math.PI / 3, 0.1, 100);

canvas.addEventListener("click", () => {
  void engine.input.requestPointerLock();
});

function update({ elapsedTime, deltaTime }: Frame): void {
  if (engine.input.isPointerLocked()) {
    cameraYaw += engine.input.getPointerDeltaX() * 0.002;
    cameraPitch = Math.max(
      -Math.PI / 2 + 0.01,
      Math.min(Math.PI / 2 - 0.01, cameraPitch - engine.input.getPointerDeltaY() * 0.002),
    );

    const forwardX = Math.cos(cameraYaw);
    const forwardZ = Math.sin(cameraYaw);
    const rightX = -forwardZ;
    const rightZ = forwardX;
    const forward = playerInput.getAxis(PlayerAction.MoveForward);
    const right = playerInput.getAxis(PlayerAction.MoveRight);
    const inputLength = Math.hypot(forward, right);
    const distance = inputLength === 0 ? 0 : (deltaTime * 2) / inputLength;

    if (isGrounded && playerInput.wasActionPressed(PlayerAction.Jump)) {
      verticalVelocity = jumpSpeed;
      isGrounded = false;
    }

    verticalVelocity += gravity * deltaTime;
    const collisions = scene.world.moveAndResolve(
      player,
      new Vector3(
        (forwardX * forward + rightX * right) * distance,
        verticalVelocity * deltaTime,
        (forwardZ * forward + rightZ * right) * distance,
      ),
    );

    isGrounded = false;

    for (const collision of collisions) {
      if (collision.normal[1] > 0 && verticalVelocity <= 0) {
        verticalVelocity = 0;
        isGrounded = true;
      }

      if (collision.normal[1] < 0 && verticalVelocity > 0) {
        verticalVelocity = 0;
      }
    }

    scene.camera.transform.rotation.setXyz(cameraPitch, -cameraYaw - Math.PI / 2, 0);
  }

  firstMesh.transform.rotation.setXyz(elapsedTime / 1.5, elapsedTime, elapsedTime / 2);
  secondMesh.transform.rotation.setXyz(-elapsedTime / 1.2, -elapsedTime / 2, -elapsedTime / 1.5);
  cubeGroup.transform.rotation.setXyz(0, elapsedTime / 4, 0);
}

engine.start(scene, update);
