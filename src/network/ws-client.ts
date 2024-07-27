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
const clearButton = document.getElementById("clear-button");

socket.on("stroke", (data: Stroke) => {
  sketch.broadcast(data);
});

socket.on("boot-up", (data: Array<Stroke>) => {
  sketch.loadCanvas(data);
});

saveButton?.addEventListener("click", () => {
  sketch.save();
});

clearButton?.addEventListener("click", () => {
  socket.emit("clear");
});

socket.on("clear", () => {
  sketch.clear();
});


//FOR TESTING ONLY
loadButton?.addEventListener("click", () => {
  socket.emit("load");
});

//load canvas on click
socket.on("loaded-tags", (data: Array<Stroke>) => {
  console.log("running");
  sketch.loadCanvas(data);
});
