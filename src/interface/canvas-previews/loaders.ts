import SessionManager from "../../session";
import PageElements from "../global/elements";

export class LoaderConstructor {
  private elements = new PageElements();

  display_CanvasLoader(id: string) {
    const oldPreview = document.getElementById(`preview-${id}`);
    const loader = document.createElement("span");
    loader.id = "canvas-loader";
    oldPreview?.replaceWith(loader);
    SessionManager.getInstance().setPreviewRef(oldPreview);
  }

  display_Loader(id: string | null) {
    const loader = document.createElement("div");
    loader.id = "loading-view";
    loader.innerText = "loading...";

    if (id) {
      const oldPreview = document.getElementById(`preview-${id}`); //update
      oldPreview?.replaceWith(loader);
    } else {
      this.elements.communityGrid()?.appendChild(loader); //append
    }
  }

  reset(preview: HTMLDivElement) {
    const loader = document.getElementById("canvas-loader");
    loader?.replaceWith(preview);
  }
}
