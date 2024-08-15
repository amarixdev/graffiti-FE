import Canvas from "../../canvas/canvas";
import SessionManager from "../../session";
import { CanvasState, Page, Previews } from "../../util/enums";
import { FetchRequests } from "../../network/fetch-requests";
import { ImageFile, ImagePreview } from "../../util/types";
import PageElements from "../global/elements";
import { LoaderConstructor } from "./loaders";
import { truncateString } from "../../util/functions";

export default class PreviewConstructor {
  private elements = new PageElements();

  /*renders a new canvas preview*/
  render(type: Previews) {
    // Canvas.getInstance().clear();
    const session = SessionManager.getInstance();
    const tagPreviews_map: Map<
      string,
      { artists: string[] | null; img: ImageFile }
    > =
      type == Previews.collection
        ? session.getTagPreviews_map() //on boot-up
        : session.getLastAddedPreview_();

    tagPreviews_map.forEach((data, id) => {
      const loadingView = document.getElementById("loading-view");
      const previewContainer = this.constructContainer(id);
      const img = this.constructImage(id, data.img, data.artists);

      previewContainer.append(img);
      previewContainer.append(this.constructArtistUI(data.artists));

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
      preview.imageFile,
      preview.artists
    );
    updatedPreview.append(img);
    updatedPreview.append(this.constructArtistUI(preview.artists));
    console.log("loadingView: " + loadingView);
    if (loadingView) {
      console.log("replacing");
      loadingView.replaceWith(updatedPreview);
    }
  }

  /*restores a canvas preview from loading state*/
  restore() {
    const loader = document.getElementById("canvas-loader");
    this.constructArtistUI(null);
    const preview = SessionManager.getInstance().getPreviewRef();
    console.log("PREVIEW: " + preview);
    if (preview) {
      loader?.replaceWith(preview);
    }
  }

  /** add styles to preview interface */
  private constructArtistUI(username: string[] | null): HTMLDivElement {
    const details = document.createElement("div");
    Object.assign(details.style, {
      width: "100%",
      height: "30px",
      marginTop: "6px",
      display: "flex",
      justifyContent: "start",
      alignItems: "center",
      paddingLeft: "5px",
      gap: "10px",
    });

    const heading = document.createElement("i");
    heading.classList.add("fa-solid", "fa-user");

    if (username) {
      let artistTag = "";
      switch (username.length) {
        case 1:
          artistTag = `${truncateString(username[0], 30)}  ${username.length}`;
          break;
        case 2:
          artistTag = `${truncateString(
            username[0],
            20
          )} and <span class="heavy">1 other</span>`;
          break;
        default:
          artistTag = `${truncateString(
            username[0],
            20
          )} and <span class="heavy">${username.length - 1} others</span>`;
          break;
      }

      const artists = document.createElement("p");
      artists.innerHTML = artistTag;
      details.appendChild(heading);
      details.appendChild(artists);
    }
    details.classList.add("font-light", "text-sm", "text-white");
    return details;
  }

  /** creates a container for a preview  */
  private constructContainer(id: string): HTMLDivElement {
    const previewContainer = document.createElement("div");

    const styles = ["shadow-black", "shadow-md", "cursor-pointer"];

    previewContainer.id = `preview-${id}`;
    Object.assign(previewContainer.style, {
      position: "relative",
      width: "290px",
      height: "280px",
      padding: "10px",
      background: "linear-gradient(to bottom, #333333, #111111)",
    });

    styles.forEach((style) => {
      previewContainer.classList.add(style);
    });
    return previewContainer;
  }

  //converts raw blob data into an img element
  private constructImage(
    id: string,
    imgFile: ImageFile,
    artists: string[] | null
  ): HTMLImageElement {
    const arrayBuffer = imgFile.buffer;
    const blob = new Blob([arrayBuffer], {
      type: imgFile.mimetype,
    });
    const url = URL.createObjectURL(blob);
    const img = document.createElement("img");

    img.addEventListener("click", async () => {
      this.constructSignatureContainer(artists);
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
    img.src = url;
    img.alt = "rendered image";
    img.style.cursor = "pointer";
    img.style.width = "100%";

    img.onload = () => {
      console.log(`Image ${id} loaded successfully`);
    };
    img.onerror = (e) => {
      console.error(`Error loading image ${id}`, e);
    };
    return img;
  }

  private constructSignatureContainer(artists: string[] | null) {
    const signatureContainer = document.getElementById("signature-container");
    if (signatureContainer) signatureContainer.innerHTML = "";

    artists?.forEach((artist) => {
      const signature = document.createElement("p");
      signature.innerText = artist;
      signatureContainer?.append(signature);
    });
  }
}
