import { Color, Engine, type Frame, Vec3 } from "@hadron/engine";
import "./main.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const engine = await Engine.create(canvas);

engine.setLightDirection(new Vec3(0.5, 0.8, 1).normalize());
engine.setAmbientLight(new Color(0.1, 0.1, 0.1));

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
  indices: new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16,
    18, 19, 20, 21, 22, 20, 22, 23,
  ]),
});

const ground = engine.createGeometry({
  positions: new Float32Array([-10, -1, -10, 10, -1, -10, 10, -1, 10, -10, -1, 10]),
  normals: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
  indices: new Uint16Array([0, 2, 1, 0, 3, 2]),
});

const scene = engine.createScene();
const firstMesh = scene.createMesh(cube);
const secondMesh = scene.createMesh(cube);
const groundMesh = scene.createMesh(ground);
const cubeGroup = scene.createNode();

firstMesh.setColor(new Color(0.2, 0.7, 1));
secondMesh.setColor(new Color(1, 0.3, 0.2));
groundMesh.setColor(new Color(0.2, 0.25, 0.3));
firstMesh.transform.position.set(0.5, 0, -2);
firstMesh.transform.scale.set(1, 1.5, 1);
secondMesh.transform.position.set(-0.5, 0, -2);
secondMesh.transform.scale.set(1.5, 1, 1);
cubeGroup.addChild(firstMesh).addChild(secondMesh);

const cameraPosition = scene.camera.transform.position;
let cameraYaw = -Math.PI / 2;
let cameraPitch = Math.atan2(-0.5, 3);

cameraPosition.set(0, 0.5, 1);
scene.camera.transform.rotation.set(cameraPitch, -cameraYaw - Math.PI / 2, 0);
scene.camera.setPerspective(Math.PI / 3, 0.1, 100);

canvas.addEventListener("click", () => {
  void canvas.requestPointerLock();
});

function update({ elapsedTime, deltaTime }: Frame): void {
  if (document.pointerLockElement === canvas) {
    cameraYaw += engine.input.getPointerDeltaX() * 0.002;
    cameraPitch = Math.max(
      -Math.PI / 2 + 0.01,
      Math.min(Math.PI / 2 - 0.01, cameraPitch - engine.input.getPointerDeltaY() * 0.002),
    );

    const forwardX = Math.cos(cameraYaw);
    const forwardZ = Math.sin(cameraYaw);
    const rightX = -forwardZ;
    const rightZ = forwardX;
    const forward = Number(engine.input.isKeyDown("KeyW")) - Number(engine.input.isKeyDown("KeyS"));
    const right = Number(engine.input.isKeyDown("KeyD")) - Number(engine.input.isKeyDown("KeyA"));
    const inputLength = Math.hypot(forward, right);
    const distance = inputLength === 0 ? 0 : (deltaTime * 2) / inputLength;

    cameraPosition.set(
      cameraPosition[0] + (forwardX * forward + rightX * right) * distance,
      cameraPosition[1],
      cameraPosition[2] + (forwardZ * forward + rightZ * right) * distance,
    );

    scene.camera.transform.rotation.set(cameraPitch, -cameraYaw - Math.PI / 2, 0);
  }

  firstMesh.transform.rotation.set(elapsedTime / 1.5, elapsedTime, elapsedTime / 2);
  secondMesh.transform.rotation.set(-elapsedTime / 1.2, -elapsedTime / 2, -elapsedTime / 1.5);
  cubeGroup.transform.rotation.set(0, elapsedTime / 4, 0);
}

engine.start(scene, update);
