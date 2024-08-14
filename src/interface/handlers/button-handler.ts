import Canvas from "../../canvas/canvas";
import SessionManager from "../../session";
import { Button, Page, RequestMethod } from "../../util/enums";
import PageElements from "../global/elements";

export default class ButtonHandler {
  private elements = new PageElements();
  private uiButtonStyles = {
    opacity: { enabled: "100%", disabled: "25%" },
    active_scale: "active:scale-95",
    cursor_allowed: "cursor-not-allowed",
  };

  saveBtn_toggle(button: Button) {
    this.elements.init_saveButton();
    this.elements.init_saveButtonContainer();
    if (this.elements.saveButton() && this.elements.saveButtonContainer()) {
      button == Button.enabled ? this.enableSaveBtn() : this.disableSaveBtn();
    }
  }

  undoBtn_toggle(button: Button) {
    this.elements.init_undoButton();
    if (this.elements.undoButton()) {
      button == Button.enabled ? this.enableUndoBtn() : this.disableUndoBtn();
    }
  }

  private enableSaveBtn() {
    const saveBtn = this.elements.saveButton();
    const saveBtnContainer = this.elements.saveButtonContainer();
    if (saveBtn && saveBtnContainer) {
      saveBtn.style.opacity = this.uiButtonStyles.opacity.enabled;
      saveBtn.classList.add(this.uiButtonStyles.active_scale);
      saveBtn.classList.remove(this.uiButtonStyles.cursor_allowed);
      saveBtnContainer.classList.add("group");
      saveBtn.addEventListener("click", this.saveHandler);
    }
  }
  private disableSaveBtn() {
    const saveBtn = this.elements.saveButton();
    const saveBtnContainer = this.elements.saveButtonContainer();
    if (saveBtn && saveBtnContainer) {
      saveBtn.style.opacity = this.uiButtonStyles.opacity.disabled;
      saveBtn.classList.remove(this.uiButtonStyles.active_scale);
      saveBtn.classList.add(this.uiButtonStyles.cursor_allowed);
      saveBtnContainer.classList.remove("group");
      saveBtn.removeEventListener("click", this.saveHandler);
    }
  }

  private enableUndoBtn() {
    const undoBtn = this.elements.undoButton();
    if (undoBtn) {
      undoBtn.style.opacity = this.uiButtonStyles.opacity.enabled;
      undoBtn.classList.add(this.uiButtonStyles.active_scale);
      undoBtn.classList.remove(this.uiButtonStyles.cursor_allowed);
      undoBtn.addEventListener("click", this.undoHandler);
    }
  }
  private disableUndoBtn() {
    const undoBtn = this.elements.undoButton();

    if (undoBtn) {
      undoBtn.style.opacity = this.uiButtonStyles.opacity.disabled;
      undoBtn.classList.remove(this.uiButtonStyles.active_scale);
      undoBtn.classList.add(this.uiButtonStyles.cursor_allowed);
      undoBtn.removeEventListener("click", this.undoHandler);
    }
  }

  //event listener for posting/saving a canvas
  private saveHandler() {
    const canvas = Canvas.getInstance();
    SessionManager.getInstance().setArtistMode(false);
    SessionManager.getInstance().setPage(Page.community);
    if (canvas.isBlank()) {
      canvas.save(RequestMethod.post);
    } else {
      canvas.save(RequestMethod.update);
    }
    // CanvasDisplay.getInstance();
  }
  private undoHandler() {
    const canvas = Canvas.getInstance();
    // canvas.undo();
  }
}
