import { io } from "socket.io-client";
import Canvas from "../canvas/canvas";
import { Socket } from "socket.io-client";
import Stroke from "../canvas/stroke";

const socket: Socket = io("http://localhost:3000", {
  withCredentials: true,
});
const sketch = new Canvas(socket);
const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");

socket.on("stroke", (data: Stroke) => {
  sketch.broadcast(data);
});

socket.on("loaded-tags", (data: Array<Stroke>) => {
  console.log("running");
  sketch.loadCanvas(data);
});

saveButton?.addEventListener("click", () => {
  sketch.save();
});

loadButton?.addEventListener("click", () => {
  sketch.load();
});
