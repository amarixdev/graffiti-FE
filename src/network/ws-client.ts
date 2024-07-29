import { io } from "socket.io-client";
import Canvas from "../canvas/canvas";
import { Socket } from "socket.io-client";
import Stroke from "../canvas/stroke";
import HelperFunctions from "../util/functions";

const socket: Socket = io("http://localhost:3000", {
  withCredentials: true,
});
const canvas = new Canvas(socket);
const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");
const clearButton = document.getElementById("clear-button");
const colorPicker = document.getElementById("color-picker");
const slider = document.getElementById("weight-slider");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");

socket.on("stroke", (data: Stroke) => {
  canvas.broadcast(data);
});

socket.on("boot-up", (data: Array<Stroke>) => {
  canvas.loadCanvas(data);
  canvas.setPreviousState(data);
});

saveButton?.addEventListener("click", () => {
  canvas.save();
});

clearButton?.addEventListener("click", () => {
  socket.emit("clear");
  canvas.clear();
});

colorPicker?.addEventListener("input", (e: Event) => {
  const target = e.target as HTMLInputElement;
  canvas.setColor(HelperFunctions.hexToRgb(target.value));
});

slider?.addEventListener("input", (e: Event) => {
  const target = e.target as HTMLInputElement;
  canvas.setWeight(parseInt(target.value));
});

zoomIn?.addEventListener("click", () => {
  console.log("clicked");
  canvas.setScaleFactor("in");
});

zoomOut?.addEventListener("click", () => {
  canvas.setScaleFactor("out");
});

//FOR TESTING ONLY
loadButton?.addEventListener("click", () => {
  socket.emit("load");
});

//load canvas on click
socket.on("loaded-tags", (data: Array<Stroke>) => {
  console.log("running");
  canvas.loadCanvas(data);
});
