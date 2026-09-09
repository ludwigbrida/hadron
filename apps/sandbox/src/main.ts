import { Mat4, Renderer } from "@hadron/engine";
import "./main.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const renderer = await Renderer.create(canvas);

renderer.setLightDirection(0.5, 0.8, 1);

const cube = {
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
