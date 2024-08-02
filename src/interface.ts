import Canvas from "./canvas/canvas";
import SocketHandler from "./socket-handler";
import Paint from "./util/paint";
import { Button } from "./util/enums";

export default class UserInterface {
  private colorPicker: HTMLElement | null;
  private saveButton: HTMLElement | null;
  private saveButtonContainer: HTMLElement | null;
  private clearButton: HTMLElement | null;
  private undoButton: HTMLElement | null;

  private uiButtonStyles = {
    opacity: { enabled: "100%", disabled: "25%" },
    active_scale: "active:scale-95",
    cursor_allowed: "cursor-not-allowed",
  };

  constructor() {
    this.colorPicker = document.getElementById("color-picker");
    this.saveButton = document.getElementById("save-btn");
    this.saveButtonContainer = document.getElementById("save-btn-container");
    this.clearButton = document.getElementById("clear-btn");
    this.undoButton = document.getElementById("undo-btn");
  }

  setup() {
    const canvas = Canvas.getInstance();
    this.colorPicker?.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement;
      canvas.setColor(Paint.hexToRgb(target.value));
    });

    //DEV ONLY
    this.clearButton?.addEventListener("click", () => {
      SocketHandler.getInstance().getSocket().emit("clear");
      canvas.clear();
    });

    //header shortcut buttons
    for (let i = 0; i < Paint.keys.length; i++) {
      const btn = document.getElementById(`color-btn-${Paint.keys[i]}`);
      btn?.addEventListener("click", () => {
        console.log("clicked");
        canvas.setColor(Paint.values[i]);
      });
    }
  }

  saveBtn_toggle(button: Button) {
    //re-initialize for HTML injection
    this.saveButton = document.getElementById("save-btn");
    this.saveButtonContainer = document.getElementById("save-btn-container");
    if (this.saveButton && this.saveButtonContainer) {
      button == Button.enabled ? this.enableSaveBtn() : this.disableSaveBtn();
    }
  }

  undoBtn_toggle(button: Button) {
    this.undoButton = document.getElementById("undo-btn");
    if (this.undoButton) {
      button == Button.enabled ? this.enableUndoBtn() : this.disableUndoBtn();
    }
  }

  private enableSaveBtn() {
    if (this.saveButton && this.saveButtonContainer) {
      this.saveButton.style.opacity = this.uiButtonStyles.opacity.enabled;
      this.saveButton.classList.add(this.uiButtonStyles.active_scale);
      this.saveButton.classList.remove(this.uiButtonStyles.cursor_allowed);
      this.saveButtonContainer.classList.add("group");
      this.saveButton?.addEventListener("click", this.saveHandler);
    }
  }

  private disableSaveBtn() {
    if (this.saveButton && this.saveButtonContainer) {
      this.saveButton.style.opacity = this.uiButtonStyles.opacity.disabled;
      this.saveButton.classList.remove(this.uiButtonStyles.active_scale);
      this.saveButton.classList.add(this.uiButtonStyles.cursor_allowed);
      this.saveButtonContainer.classList.remove("group");
      this.saveButton?.removeEventListener("click", this.saveHandler);
    }
  }

  private enableUndoBtn() {
    if (this.undoButton) {
      this.undoButton.style.opacity = this.uiButtonStyles.opacity.enabled;
      this.undoButton.classList.add(this.uiButtonStyles.active_scale);
      this.undoButton.classList.remove(this.uiButtonStyles.cursor_allowed);
      this.undoButton?.addEventListener("click", this.undoHandler);
    }
  }

  private disableUndoBtn() {
    if (this.undoButton) {
      this.undoButton.style.opacity = this.uiButtonStyles.opacity.disabled;
      this.undoButton.classList.remove(this.uiButtonStyles.active_scale);
      this.undoButton.classList.add(this.uiButtonStyles.cursor_allowed);
      this.undoButton?.removeEventListener("click", this.undoHandler);
    }
  }

  private saveHandler() {
    const canvas = Canvas.getInstance();
    canvas.save();
  }
  private undoHandler() {
    const canvas = Canvas.getInstance();
    canvas.undo();
  }
}
