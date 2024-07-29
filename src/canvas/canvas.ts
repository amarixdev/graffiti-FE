import p5 from "p5";
import { Socket } from "socket.io-client";
import Stroke from "./stroke";
import HelperFunctions from "../util/functions";

export default class Canvas {
  #socket: Socket;
  #p: p5;
  #tag: Array<Stroke> = new Array();
  #color: Array<number> = [255, 255, 255];
  #weight: number = 5;
  #scaleFactor: number = 1;
  #offsetX: number = 0;
  #offsetY: number = 0;
  prevX: number = 0;
  prevY: number = 0;

  constructor(socket: Socket) {
    this.#socket = socket;
    this.#p = new p5(this.#init);
  }

  setColor(rgb: Array<number>) {
    this.#color = rgb;
  }

  setWeight(weight: number) {
    this.#weight = weight;
  }

  setScaleFactor(zoom: string) {
    const maxScale = 1.0;
    const minScale = 0.05;
    if (zoom == "out") {
      if (this.#scaleFactor == minScale) return;
      this.#scaleFactor = Math.max(this.#scaleFactor - 0.1, minScale);
    }
    if (zoom == "in") {
      if (this.#scaleFactor == maxScale) return;
      this.#scaleFactor = Math.min(this.#scaleFactor + 0.1, maxScale);
    }
    this.clear();
    this.#p.redraw();
  }

  //broadcast live paint stroke from websocket server data
  broadcast(stroke: Stroke) {
    this.#sprayB(stroke);
  }

  //recreate canvas from provided Stroke values
  loadCanvas(data: Array<Stroke>) {
    data.forEach((stroke) => {
      const rgb = HelperFunctions.stringToRGB(stroke.color);
      this.#spray(stroke.x, stroke.y, rgb, stroke.size);
    });
  }
  //send local painting to server for storage
  save() {
    this.#socket.emit("save", this.#tag);
  }

  //clear canvas pixels, reset background
  clear() {
    this.#p.clear();
    this.#p.background(200,200,200);
  }

  #init = (p: p5) => {
    const container = document.getElementById("canvas-container");
    if (container) {
      p.setup = () => {
        p.createCanvas(p.windowWidth * 5, p.windowHeight * 5).parent(
          "canvas-container"
        );
        p.background(200, 200, 200);
      };
    }

    p.draw = () => {
      p.translate(this.#offsetX, this.#offsetY);
      p.scale(this.#scaleFactor);
      this.#spray(p.mouseX, p.mouseY, this.#color, this.#weight);
    };

    // handlePainting
    p.mouseDragged = () => {
      const rgb = this.#color;
      const colorString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      let xPos = (p.mouseX - this.#offsetX) / this.#scaleFactor;
      let yPos = (p.mouseY - this.#offsetY) / this.#scaleFactor;

      //sent previous x/y to server
      const strokeMessage: Stroke = {
        x: xPos,
        y: yPos,
        px: this.prevX,
        py: this.prevY,
        color: colorString,
        size: this.#weight,
      };
      this.#publishToServer(strokeMessage);
    };
  };

  #spray(x: number, y: number, color: number[], size: number) {
    let p = this.#p;
    let density = 50;

    // Store the previous mouse position
    if (!this.prevX || !this.prevY) {
      this.prevX = x;
      this.prevY = y;
    }

    // Calculate the distance between the current and previous positions
    let distance = p.dist(x, y, this.prevX, this.prevY);
    let steps = Math.ceil(distance / size);

    for (let i = 0; i < steps; i++) {
      let interX = p.lerp(this.prevX, x, i / steps);
      let interY = p.lerp(this.prevY, y, i / steps);

      for (let j = 0; j < density; j++) {
        let angle = p.random(p.TWO_PI);
        let radius = p.random(0, 12);
        let offsetX = p.cos(angle) * radius;
        let offsetY = p.sin(angle) * radius;
        let alpha = p.map(radius, 0, 12, 255, 0);

        if (p.mouseIsPressed) {
          p.noStroke();
          p.fill(color[0], color[1], color[2], alpha * 0.3); // Adjust opacity as needed
          p.ellipse(interX + offsetX, interY + offsetY, size, size);
        }
      }
    }

    // Update the previous mouse position
    this.prevX = x;
    this.prevY = y;
  }

  #sprayB(stroke: Stroke) {
    let { x, y, px, py, size, color } = stroke;
    let p = this.#p;
    let density = 50;
    const rgb = HelperFunctions.stringToRGB(color);

    // Store the previous mouse position
    if (!px || !py) {
      px = x;
      py = y;
    }

    // Calculate the distance between the current and previous positions
    let distance = p.dist(x, y, px, py);
    let steps = Math.ceil(distance / size);

    for (let i = 0; i < steps; i++) {
      let interX = p.lerp(px, x, i / steps);
      let interY = p.lerp(py, y, i / steps);

      for (let j = 0; j < density; j++) {
        let angle = p.random(p.TWO_PI);
        let radius = p.random(0, 12);
        let offsetX = p.cos(angle) * radius;
        let offsetY = p.sin(angle) * radius;
        let alpha = p.map(radius, 0, 12, 255, 0);

        p.noStroke();
        p.fill(rgb[0], rgb[1], rgb[2], alpha * 0.3); // Adjust opacity as needed
        p.ellipse(interX + offsetX, interY + offsetY, size, size);
      }
    }

    // Update the previous mouse position
    this.prevX = x;
    this.prevY = y;
  }

  //live update websockets server with real-time paint strokes
  #publishToServer(strokeMessage: Stroke) {
    //send paint stroke to server
    this.#socket.emit("stroke", strokeMessage);
    console.log("send");
    //create tag to save work
    this.#tag.push(strokeMessage);
  }
}
