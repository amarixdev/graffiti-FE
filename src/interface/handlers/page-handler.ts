import Canvas from "../../canvas/canvas";
import SessionManager from "../../session";
import { Page } from "../../util/enums";
import PageElements from "../global/elements";

export default class PageHandler {
  private elements = new PageElements();

  updatePageUI() {
    console.log("page changing...");
    const pageToggle = document.getElementById("page-toggler");
    const session = SessionManager.getInstance();

    if (this.elements.communityPage()?.classList.contains("hidden")) {
      this.displayCommunityPage();
      session.setPage(Page.community);
    } else {
      console.log("displaying canvas page");
      this.displayCanvasPage();
      session.setPage(Page.canvas);
    }

    if (pageToggle) {
      console.log(session.getPage());
      pageToggle.innerHTML =
        session.getPage() == Page.community
          ? `<i class="fa-solid fa-user-group"></i>`
          : `<i class="fa-solid fa-paintbrush "></i>`;
    }

    if (session.isArtistMode()) {
      this.elements.artistButtons()?.classList.remove("hidden");
      this.elements.tagButton()?.classList.add("hidden");
      this.elements.previewButtons()?.classList.add("hidden");
      this.elements.viewArtistsButton()?.classList.add("hidden");
    } else {
      this.elements.artistButtons()?.classList.add("hidden");
      this.elements.tagButton()?.classList.remove("hidden");
      this.elements.previewButtons()?.classList.remove("hidden");
      this.elements.viewArtistsButton()?.classList.remove("hidden");
    }
  }

  private displayCommunityPage() {
    console.log(this.elements.canvasPage());
    if (this.elements.communityPage() && this.elements.canvasPage()) {
      this.elements.saveButton()?.classList.add("hidden");
      this.elements.undoButton()?.classList.add("hidden");
      this.elements.canvasPage()?.classList.add("hidden");
      this.elements.communityPage()?.classList.remove("hidden");
    }
  }

  private displayCanvasPage() {
    if (this.elements.canvasContainer() && this.elements.communityPage()) {
      const canvasPage = this.elements.canvasPage();
      if (canvasPage) {
        canvasPage.classList.remove("hidden");
      }

      this.elements.saveButton()?.classList.remove("hidden");
      this.elements.undoButton()?.classList.remove("hidden");
      this.elements.communityPage()?.classList.add("hidden");
    }
  }
}
