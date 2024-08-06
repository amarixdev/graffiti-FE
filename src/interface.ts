import Canvas from "./canvas/canvas";
import SocketHandler from "./socket-handler";
import Paint from "./util/paint";
import {
  Button,
  CanvasState,
  Page,
  Previews,
  RequestMethod,
} from "./util/enums";
import SessionManager from "./session";
import { ImageFile, ImagePreview } from "./util/types";
import { FetchRequests } from "./util/fetch-requests";
import { randomUUID } from "crypto";

export default class UserInterface {
  private colorPicker: HTMLElement | null;
  private saveButton: HTMLElement | null;
  private saveButtonContainer: HTMLElement | null;
  private clearButton: HTMLElement | null;
  private undoButton: HTMLElement | null;
  private canvasPage: HTMLElement | null;
  private communityPage: HTMLElement | null;
  private uiButtonStyles = {
    opacity: { enabled: "100%", disabled: "25%" },
    active_scale: "active:scale-95",
    cursor_allowed: "cursor-not-allowed",
  };

  private communityGrid: HTMLElement | null;
  constructor() {
    this.colorPicker = document.getElementById("color-picker");
    this.saveButton = document.getElementById("save-btn");
    this.saveButtonContainer = document.getElementById("save-btn-container");
    this.clearButton = document.getElementById("clear-btn");
    this.undoButton = document.getElementById("undo-btn");
    this.communityPage = document.getElementById("community-container");
    this.canvasPage = document.getElementById("canvas-container");
    this.communityGrid = document.getElementById("community-grid");
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
        canvas.setColor(Paint.values[i]);
      });
    }

    const pageToggle = document.getElementById("page-toggler");

    if (pageToggle) {
      pageToggle.addEventListener("click", () => {
        this.updatePageUI();
      });
    }
  }

  updatePageUI() {
    const pageToggle = document.getElementById("page-toggler");
    const session = SessionManager.getInstance();
    setTimeout(() => {
      if (this.communityPage?.classList.contains("hidden")) {
        this.displayCommunityPage();
        session.setPage(Page.community);
      } else {
        this.displayCanvasPage();
        session.setPage(Page.canvas);
      }
      if (pageToggle) {
        pageToggle.innerText =
          session.getPage() == Page.canvas ? "Canvas" : "Community";
      }
    }, 0);
  }

  private displayCommunityPage() {
    if (this.canvasPage && this.communityPage) {
      this.canvasPage?.classList.add("hidden");
      this.saveButton?.classList.add("hidden");
      this.undoButton?.classList.add("hidden");

      this.communityPage?.classList.remove("hidden");
    }
  }

  private displayCanvasPage() {
    if (this.canvasPage && this.communityPage) {
      this.canvasPage?.classList.remove("hidden");
      this.saveButton?.classList.remove("hidden");
      this.undoButton?.classList.remove("hidden");

      this.communityPage?.classList.add("hidden");
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

  //event listener for posting/saving a canvas
  private saveHandler() {
    const canvas = Canvas.getInstance();
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
    canvas.undo();
  }

  renderLoader() {
    //render a loading view for a new canvas preview
    const loader = document.createElement("div");
    loader.id = "loading-view";
    loader.innerText = "loading...";
    this.communityGrid?.appendChild(loader);
  }

  //render a loading view for updated canvas preview
  updateLoader(id: string) {
    const oldPreview = document.getElementById(`preview-${id}`);
    const loader = document.createElement("div");
    loader.id = "loading-view";
    loader.innerText = "loading...";
    oldPreview?.replaceWith(loader);
  }

  //handles rendering for all newly added canvas previews; handles initial UI display
  renderPreviews(type: Previews) {
    Canvas.getInstance().clear();
    const session = SessionManager.getInstance();
    const tagPreviews_map: Map<string, ImageFile> =
      type == Previews.collection
        ? session.getTagPreviews_map()
        : session.getLastAddedPreview_();

    tagPreviews_map.forEach((imgFile, id) => {
      const loadingView = document.getElementById("loading-view");
      const previewContainer = this.constructContainer(id);
      const img = this.constructImage(id, imgFile);
      previewContainer.append(img);

      if (loadingView) {
        loadingView.replaceWith(previewContainer);
      }
      this.communityGrid?.appendChild(previewContainer);
    });
  }

  //handles updated canvas preview display
  updatePreview(preview: ImagePreview) {
    const loadingView = document.getElementById("loading-view");
    let updatedPreview: HTMLDivElement = this.constructContainer(preview.id);
    const img: HTMLImageElement = this.constructImage(
      preview.id,
      preview.imageFile
    );
    updatedPreview.append(img);

    if (loadingView) {
      loadingView.replaceWith(updatedPreview);
    }
  }

  //converts raw blob data into an img element
  private constructImage(id: string, imgFile: ImageFile): HTMLImageElement {
    const arrayBuffer = imgFile.buffer;
    const blob = new Blob([arrayBuffer], {
      type: imgFile.mimetype,
    });

    const url = URL.createObjectURL(blob);
    const img = document.createElement("img");
    img.style.height = "100%";
    img.style.width = "100%";
    img.src = url;
    img.alt = "rendered image";
    img.onload = () => {
      console.log(`Image ${id} loaded successfully`);
    };
    img.onerror = (e) => {
      console.error(`Error loading image ${id}`, e);
    };
    return img;
  }

  //creates the dimensions and style for the canvas preview container
  private constructContainer(id: string): HTMLDivElement {
    const previewContainer = document.createElement("div");
    previewContainer.id = `preview-${id}`;
    previewContainer.style.width = "350px";
    previewContainer.style.height = "191px";
    previewContainer.style.border = "solid black 2px";
    previewContainer.style.cursor = "pointer";
    previewContainer.addEventListener("click", async () => {
      SessionManager.getInstance().setPage(Page.canvas);
      await FetchRequests.renderCanvas(id).then((data) => {
        console.log("Success:", data);
        const canvas = Canvas.getInstance();
        canvas.setCanvasId(id);
        canvas.loadCanvas(data.strokes, CanvasState.edit);
        this.updatePageUI();
      });
    });
    return previewContainer;
  }
}
