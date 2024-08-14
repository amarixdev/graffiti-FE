import Canvas from "../../canvas/canvas";
import SessionManager from "../../session";
import { CanvasState, Page, Previews } from "../../util/enums";
import { FetchRequests } from "../../network/fetch-requests";
import { ImageFile, ImagePreview } from "../../util/types";
import PageElements from "../global/elements";
import { LoaderConstructor } from "./loaders";

export default class PreviewConstructor {
  private elements = new PageElements();

  /*renders a new canvas preview*/
  render(type: Previews) {
    // Canvas.getInstance().clear();
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
      previewContainer.append(this.stylePreviewUI());
      const tagAlert = document.createElement("img");

      previewContainer.appendChild(tagAlert);
      if (loadingView) {
        loadingView.replaceWith(previewContainer);
      }
      this.elements.communityGrid()?.appendChild(previewContainer);
    });
  }

  /*updates a canvas preview*/
  update(preview: ImagePreview) {
    const loadingView = document.getElementById("loading-view");
    let updatedPreview: HTMLDivElement = this.constructContainer(preview.id);
    const img: HTMLImageElement = this.constructImage(
      preview.id,
      preview.imageFile
    );
    updatedPreview.append(img);
    updatedPreview.append(this.stylePreviewUI());
    console.log("loadingView: " + loadingView);
    if (loadingView) {
      console.log("replacing");
      loadingView.replaceWith(updatedPreview);
    }
  }

  /*restores a canvas preview from loading state*/
  restore() {
    const loader = document.getElementById("canvas-loader");
    this.stylePreviewUI();
    const preview = SessionManager.getInstance().getPreviewRef();
    if (preview) {
      loader?.replaceWith(preview);
    }
  }

  /** add styles to preview interface */
  private stylePreviewUI(): HTMLDivElement {
    const details = document.createElement("div");
    details.style.width = "100%";
    details.style.height = "30px";
    details.style.marginTop = "6px";
    details.style.display = "flex";
    details.style.justifyContent = "center";
    const viewArtistBtn = document.createElement("button");
    viewArtistBtn.innerText = "View Artists";

    details.appendChild(viewArtistBtn);
    details.classList.add("font-light", "text-sm", "text-white");
    return details;
  }

  /** creates a container for a preview  */
  private constructContainer(id: string): HTMLDivElement {
    const previewContainer = document.createElement("div");

    const styles = ["shadow-black", "shadow-md", "cursor-pointer"];

    previewContainer.id = `preview-${id}`;
    previewContainer.style.position = "relative";
    previewContainer.style.width = "290px";
    previewContainer.style.height = "280px";
    previewContainer.style.padding = "10px";
    previewContainer.style.background =
      "linear-gradient(to bottom, #333333, #111111)";

    styles.forEach((style) => {
      previewContainer.classList.add(style);
    });
    return previewContainer;
  }

  //converts raw blob data into an img element
  private constructImage(id: string, imgFile: ImageFile): HTMLImageElement {
    const arrayBuffer = imgFile.buffer;
    const blob = new Blob([arrayBuffer], {
      type: imgFile.mimetype,
    });
    const url = URL.createObjectURL(blob);
    const img = document.createElement("img");

    img.addEventListener("click", async () => {
      const session = SessionManager.getInstance();
      session.setPage(Page.canvas);
      session.setArtistMode(false);
      new LoaderConstructor().display_CanvasLoader(id);

      //TODO: Add cursor-not-allowed and disable event listener during load

      //fetch canvas from database or client storage (indexedDB)
      await FetchRequests.renderCanvas(id).then((data: any) => {
        console.log("Success:", data);
        const canvas = Canvas.getInstance(); //cannot setup canvas if it is hidden
        canvas.clear();
        canvas.setCanvasId(id);
        if (data.isLocal) {
          canvas.loadBitmap(data.canvas.bitmap, data.canvas.strokes);
        } else {
          canvas.loadCanvas(data.strokes, CanvasState.edit);
        }
      });
    });

    img.id = `img-${id}`;
    img.className = "img-opacity-dim";
    img.style.cursor = "pointer";
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
}
