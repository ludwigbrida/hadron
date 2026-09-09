import { Mat4, Renderer } from "@hadron/engine";
import "./main.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const renderer = await Renderer.create(canvas);

const cube = {
  positions: new Float32Array([
    -0.25, -0.25, -0.25, 0.25, -0.25, -0.25, 0.25, 0.25, -0.25, -0.25, 0.25, -0.25, -0.25, -0.25,
    0.25, 0.25, -0.25, 0.25, 0.25, 0.25, 0.25, -0.25, 0.25, 0.25,
  ]),
  indices: new Uint16Array([
    0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5, 0, 1, 5, 0, 5, 4, 3, 7,
    6, 3, 6, 2,
  ]),
};

const firstMesh = renderer.createMesh(cube);
const secondMesh = renderer.createMesh(cube);
const meshes = [firstMesh, secondMesh];

firstMesh.setColor(new Float32Array([0.2, 0.7, 1, 1]));
secondMesh.setColor(new Float32Array([1, 0.3, 0.2, 1]));

const firstTransform = new Mat4();
const firstTranslation = new Mat4();
const firstRotation = new Mat4();
const secondTransform = new Mat4();
const secondTranslation = new Mat4();
const secondRotation = new Mat4();
const projection = new Mat4();

Mat4.fromTranslation(firstTranslation, 0.5, 0, -2);
Mat4.fromTranslation(secondTranslation, -0.5, 0, -2);

function updateProjection(): void {
  Mat4.fromPerspective(projection, Math.PI / 3, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  renderer.setViewProjection(projection);
}

new ResizeObserver(updateProjection).observe(canvas);
updateProjection();

function render(time: number): void {
  Mat4.fromRotationY(firstRotation, time / 1_000);
  Mat4.multiply(firstTransform, firstTranslation, firstRotation);
  firstMesh.setTransform(firstTransform);

  Mat4.fromRotationY(secondRotation, -time / 2_000);
  Mat4.multiply(secondTransform, secondTranslation, secondRotation);
  secondMesh.setTransform(secondTransform);

  renderer.render(meshes);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
