import { Renderer } from "@hadron/engine";
import "./main.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const renderer = await Renderer.create(canvas);

renderer.render();
