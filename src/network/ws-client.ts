import { io } from "socket.io-client";
import Canvas from "../canvas/canvas";
import { Socket } from "socket.io-client";
import Stroke from "../canvas/stroke";
import HelperFunctions from "../util/functions";
import { SocketType } from "../util/types";

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
const chatInput = document.getElementById("chat-input") as HTMLInputElement;
const chatForm = document.getElementById("chat-form");
const chatLog = document.getElementById("chat-log");
const artistsOnline = document.getElementById("artists-online");

let username: string = "";

socket.on("stroke", (data: Stroke) => {
  canvas.broadcast(data);
});

socket.on("boot-up", (data: Array<Stroke>, user: string) => {
  canvas.loadCanvas(data);
  username = user;
  // canvas.setPreviousState(data);
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

//handle client connection
socket.on("client-connected", (data: number) => {
  if (artistsOnline) {
    artistsOnline.innerText = `${data}`;
  }
});

socket.on("client-disconnected", (data: number) => {
  if (artistsOnline) {
    artistsOnline.innerText = `${data}`;
  }
});

//handle live chat
socket.on("chat", (data: string, user: string) => {
  addMessage(data, SocketType.remote, user);
});

chatForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  let message = chatInput.value;
  if (message) {
    socket.emit("chat", message);
    addMessage(message, SocketType.user, username);
    chatInput.value = "";
  }
});

function addMessage(message: string, type: SocketType, user: string) {
  // Create the container div
  const newMessage = document.createElement("div");
  newMessage.className = "chat-container";

  // Set the background color based on the message type
  if (type === SocketType.remote) {
    newMessage.style.backgroundColor = "#333"; // Apply background color directly
  } else if (type === SocketType.user) {
    newMessage.style.backgroundColor = "#2a92e8"; // Apply background color directly
  }

  // Create the user paragraph
  const userBubble = document.createElement("p");
  userBubble.className = "user";
  userBubble.textContent = user;

  // Create the message paragraph
  const remoteBubble = document.createElement("p");
  remoteBubble.className = "message";
  remoteBubble.textContent = message;

  // Append paragraphs to the container span
  newMessage.appendChild(userBubble);
  newMessage.appendChild(remoteBubble);

  // Insert the new message as the first child
  chatLog?.insertBefore(newMessage, chatLog.firstChild);
}

//FOR TESTING ONLY
loadButton?.addEventListener("click", () => {
  socket.emit("load");
});

//load canvas on click
socket.on("loaded-tags", (data: Array<Stroke>) => {
  console.log("running");
  canvas.loadCanvas(data);
});
