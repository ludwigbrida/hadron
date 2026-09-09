import { Renderer } from "@hadron/engine";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

await Renderer.create(canvas);
