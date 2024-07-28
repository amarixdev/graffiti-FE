import { io } from "socket.io-client";
import Canvas from "../canvas/canvas";
import { Socket } from "socket.io-client";
import Stroke from "../canvas/stroke";
import HelperFunctions from "../util/functions";

const socket: Socket = io("http://localhost:3000", {
  withCredentials: true,
});
const sketch = new Canvas(socket);
const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");
const clearButton = document.getElementById("clear-button");
const colorPicker = document.getElementById("color-picker");
const slider = document.getElementById("weight-slider");

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

colorPicker?.addEventListener("input", (e: Event) => {
  const target = e.target as HTMLInputElement;
  sketch.setColor(HelperFunctions.hexToRgb(target.value));
});

slider?.addEventListener("input", (e: Event) => {
  const target = e.target as HTMLInputElement;
  sketch.setWeight(parseInt(target.value));
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
