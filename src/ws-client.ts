import { io } from "socket.io-client";
import Sketch from "./canvas";
import { Socket } from "socket.io-client"
import p5 from "p5";
import { BrushStroke } from "./util/types";

const socket:Socket = io("http://localhost:3000", {
  withCredentials: true,
});

const sketch = new Sketch(socket)

socket.on("stroke", (data:BrushStroke) => {
  sketch.broadcast(data)
})
