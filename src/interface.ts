import Canvas from "./canvas/canvas";
import Paint from "./util/paint";

export default class Interface {
  canvas: Canvas;
  constructor() {
    this.canvas = Canvas.getInstance();
  }

  setup() {
    const colorPicker = document.getElementById("color-picker");
    const saveButton = document.getElementById("save-button");
    const zoomIn = document.getElementById("zoom-in");
    const zoomOut = document.getElementById("zoom-out");

    colorPicker?.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement;
      this.canvas.setColor(Paint.hexToRgb(target.value));
    });
    for (let i = 0; i < Paint.keys.length; i++) {
      const btn = document.getElementById(`color-btn-${Paint.keys[i]}`);
      btn?.addEventListener("click", () => {
        this.canvas.setColor(Paint.values[i]);
      });
    }
  }
}
