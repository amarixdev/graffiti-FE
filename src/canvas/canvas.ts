import p5 from "p5";
import { Socket } from "socket.io-client";
import Stroke, { PaintStrokes } from "./paintstrokes";
import Paint from "../util/paint";
import SocketHandler from "../network/socket-handler";
import { Button, Page, RequestMethod, SocketType } from "../util/enums";
import UInterface from "../interface/main";
import ServerOperations from "./server-operations";
import { CanvasState } from "../util/enums";
import { FetchRequests } from "../network/fetch-requests";
import Worker from "./worker?worker";
import SessionManager from "../session";
import IndexDBManager from "../storage/indexed-db";
import PageElements from "../interface/global/elements";

export default class Canvas {
  private p: p5;
  private socket: Socket;
  private canvasId: string = "";
  private interface: UInterface = new UInterface();
  private blankCanvas: boolean = true;
  private tag: Array<Stroke> = new Array();
  private paintStrokes: PaintStrokes = new PaintStrokes();
  private paintStroke: Array<Stroke> = new Array();
  private isPainting: boolean = false;
  private color: Array<number> = [255, 255, 255];
  private weight: number = 5;
  private prevX: number = 0;
  private prevY: number = 0;
  private bitmap: any | null = null;

  private constructor(socket: Socket) {
    this.socket = socket;
    this.p = new p5(this.init);
  }

  //ensure a single instance of the socket is created
  private static instance: Canvas;
  static getInstance() {
    if (!Canvas.instance) {
      console.log("setting up canvas");
      Canvas.instance = new Canvas(SocketHandler.getInstance().getSocket());
    }
    return Canvas.instance;
  }

  getCanvasId() {
    return this.canvasId;
  }

  setCanvasId(id: string) {
    this.canvasId = id;
  }

  setColor(rgb: Array<number>): void {
    const colorPicker = document.getElementById(
      "color-picker"
    ) as HTMLInputElement;
    this.color = rgb;
    colorPicker.value = Paint.rgbToHex(this.color);
  }

  setWeight(weight: number): void {
    this.weight = weight;
  }

  getSocket(): Socket {
    return this.socket;
  }

  //broadcast live paint stroke from websocket server data
  broadcast(stroke: Stroke): void {
    this.spray(stroke);
  }

  loadBitmap(bitmap: ImageBitmap, strokes: Array<Stroke>) {
    this.bitmap = bitmap;
    this.p.redraw();
    this.blankCanvas = false;
    this.paintStrokes.setOriginal(strokes);
  }

  //recreate canvas from provided Stroke values (FIX: live / undo )
  loadCanvas(data: Array<Stroke>, state: CanvasState): void {
    console.log("loading....");
    this.clear();
    const worker = new Worker();
    const canvas = new OffscreenCanvas(1200, 700);

    let computed = data.map((stroke) => {
      let result = this.sprayLoad(stroke);
      return result;
    });
    console.log("sending to worker");
    worker.postMessage({ computed: computed, canvas: canvas }, [canvas]);

    worker.onmessage = (event) => {
      // new PageElements().canvasPage()?.classList.remove("hidden");
      console.log("bitmap start");
      this.bitmap = event.data;
      const mainCanvas = document.getElementById(
        "artist-canvas"
      ) as HTMLCanvasElement;
      const ctx = mainCanvas.getContext("2d");

      if (mainCanvas && ctx) {
        // Draw the bitmap onto the main canvas
        this.p.redraw();
        console.log("bitmap done");
      }
    };
    //if tagging existing canvas...
    if (state == CanvasState.edit) {
      this.paintStrokes = new PaintStrokes();
      this.paintStrokes.setOriginal(data);
      this.paintStrokes.push(data);
      this.blankCanvas = false;
    }
  }

  isBlank(): boolean {
    return this.blankCanvas;
  }

  //clear canvas pixels; reset background
  clear(): void {
    this.p.clear();
    this.p.background(200, 200, 200);
  }

  save(method: RequestMethod): void {
    ServerOperations.compressAndSendToServer(method);

    //remove caching for altered canvas; needs to re-fetch updated art
    FetchRequests.removeCache(this.canvasId);
  }

  getTag(): Array<Stroke> {
    return this.tag;
  }

  setTag(tag: Array<Stroke>): void {
    this.tag = tag;
  }

  getPaintStrokes(): Array<Stroke> {
    return this.paintStrokes.get();
  }

  resetPaintStrokes(): void {
    this.paintStrokes.reset();
    this.blankCanvas = true;
  }

  // undo(): void {
  //   this.paintStrokes.pop();
  //   this.clear();
  //   //TODO: <!BUG!> deleting loaded data.. Also too slow, needs re-write
  //   this.paintStrokes.forEach((stroke) => {
  //     this.loadCanvas(stroke, CanvasState.new);
  //   });

  //   if (this.paintStrokes.length == 0) {
  //     this.interface.undoBtn_toggle(Button.disabled);
  //   }
  // }

  startLoop() {
    this.p.loop();
  }

  resizeCanvas() {
    const container = document.getElementById("canvas-container");
    if (container) {
      this.p.resizeCanvas(container.clientWidth, container.clientHeight);
      this.p.background(200, 200, 200);
    }
  }

  private init = (p: p5) => {
    const container = document.getElementById("canvas-container");
    if (container) {
      p.setup = () => {
        const canvas = p
          .createCanvas(container.clientWidth, container.clientHeight)
          .parent(container);
        canvas.id("artist-canvas");
        p.background(200, 200, 200);
      };

      p.windowResized = () => {
        this.resizeCanvas();
      };
    }

    p.draw = async () => {
      if (this.bitmap) {
        // Draw the bitmap image onto the canvas
        p.drawingContext.drawImage(
          this.bitmap,
          0,
          0,
          this.bitmap.width,
          this.bitmap.height
        );
        // p.filter("blur", 1);

        const bitmap = await createImageBitmap(this.bitmap); // Assuming you have an ImageBitmap

        IndexDBManager.getInstance().store(
          bitmap,
          this.canvasId,
          this.paintStrokes.get()
        );

        this.bitmap = null;
        console.log("done");
        //handle page updates;
        const ui = new UInterface();
        ui.restorePreview();
        ui.updatePage();
      }
      const stroke: Stroke = {
        x: p.mouseX,
        y: p.mouseY,
        px: this.prevX,
        py: this.prevY,
        color: Paint.RGBToString(this.color),
        size: this.weight,
      };

      const artistMode = SessionManager.getInstance().isArtistMode();
      if (!artistMode) {
        p.noLoop();
      }
      this.spray(stroke);
    };

    //handles live stroke updates
    p.mouseDragged = () => {
      if (this.tag.length == 0) {
        this.interface.saveBtn_toggle(Button.enabled);
        this.interface.undoBtn_toggle(Button.enabled);
      }
      const strokeMessage: Stroke = {
        x: p.mouseX,
        y: p.mouseY,
        px: this.prevX,
        py: this.prevY,
        color: Paint.RGBToString(this.color),
        size: this.weight,
      };
      ServerOperations.publishToServer(strokeMessage);
    };

    p.keyTyped = () => {
      let key = p.key;
      Paint.colorSwitch(key, "color-backdrop");
      Paint.colorSwitch(key, "artist-container");
    };
  };

  private sprayLoad(stroke: Stroke) {
    let { x, y, px, py, size, color } = stroke;

    let p = this.p;
    let density = 300;
    let rgb = Paint.stringToRGB(color);
    const ellipses = [];
    // Calculate the distance between the current and previous positions
    let distance = p.dist(x, y, px, py);
    let steps = Math.ceil(distance / 7);

    //spray-paint effect
    for (let i = 0; i < steps; i++) {
      let interX = p.lerp(px, x, i / steps);
      let interY = p.lerp(py, y, i / steps);

      for (let j = 0; j < density; j++) {
        let angle = p.random(p.TWO_PI);
        let radius = p.random(0, 10);
        let offsetX = p.cos(angle) * radius;
        let offsetY = p.sin(angle) * radius;
        let alpha = p.map(radius, 0, 12, 255, 0);
        const data = {
          x: interX + offsetX,
          y: interY + offsetY,
          size: 1,
          color: [rgb[0], rgb[1], rgb[2], alpha],
        };
        ellipses.push(data);
      }
    }
    return ellipses;
  }

  private spray(stroke: Stroke) {
    let { x, y, px, py, size, color } = stroke;
    let p = this.p;
    let density = 50;

    let rgb = Paint.stringToRGB(color);

    // Store the previous mouse position
    // if (!px || !py) {
    //   px = x;
    //   py = y;
    // }

    // Calculate the distance between the current and previous positions
    let distance = p.dist(x, y, px, py);
    let steps = Math.ceil(distance / size);

    //spray-paint effect
    for (let i = 0; i < steps; i++) {
      let interX = p.lerp(px, x, i / steps);
      let interY = p.lerp(py, y, i / steps);

      for (let j = 0; j < density; j++) {
        let angle = p.random(p.TWO_PI);
        let radius = p.random(0, 12);
        let offsetX = p.cos(angle) * radius;
        let offsetY = p.sin(angle) * radius;
        let alpha = p.map(radius, 0, 12, 255, 0);

        if (p.mouseIsPressed) {
          drawEllipse();
          if (!this.isPainting) {
            this.isPainting = true;
          }
        } else {
          //mouse lifted, save paintStrokes
          if (this.isPainting) {
            this.isPainting = false;
            this.paintStrokes.insertNew(this.paintStroke);
            this.paintStroke = [];
          }
        }

        function drawEllipse() {
          p.noStroke();
          p.fill(rgb[0], rgb[1], rgb[2], 0.3 * alpha); // Adjust opacity as needed
          p.ellipse(interX + offsetX, interY + offsetY, size, size);
        }
      }
    }

    //(Socket.type == user) ONLY ~~~~

    //saves individual strokes to an array (used for undo function)
    if (this.isPainting) {
      this.paintStroke.push(stroke);
      this.interface.undoBtn_toggle(Button.enabled);
    }

    // Update the previous mouse position
    this.prevX = x;
    this.prevY = y;
  }
}
