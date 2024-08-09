import SessionManager from "../../session";
import { Page } from "../../util/enums";
import PageElements from "../global/elements";

export default class PageHandler {
  private elements = new PageElements();

  updatePageUI() {
    const pageToggle = document.getElementById("page-toggler");
    const session = SessionManager.getInstance();

    if (!session.isArtistMode()) {
      if (this.elements.communityPage()?.classList.contains("hidden")) {
        this.displayCommunityPage();
        session.setPage(Page.community);
      } else {
        this.displayCanvasPage();
        session.setPage(Page.canvas);
      }

      //DEV ONLY
      if (pageToggle) {
        pageToggle.innerText =
          session.getPage() == Page.canvas ? "Canvas" : "Community";
      }
    }

    if (session.isArtistMode()) {
      this.elements.artistButtons()?.classList.remove("hidden");
      this.elements.tagButton()?.classList.add("hidden");
    } else {
      this.elements.artistButtons()?.classList.add("hidden");
      this.elements.tagButton()?.classList.remove("hidden");
    }
  }

  private displayCommunityPage() {
    if (this.elements.canvasPage() && this.elements.communityPage()) {
      this.elements.canvasPage()?.classList.add("hidden");
      this.elements.saveButton()?.classList.add("hidden");
      this.elements.undoButton()?.classList.add("hidden");

      this.elements.communityPage()?.classList.remove("hidden");
    }
  }

  private displayCanvasPage() {
    if (this.elements.canvasPage() && this.elements.communityPage()) {
      this.elements.canvasPage()?.classList.remove("hidden");
      this.elements.saveButton()?.classList.remove("hidden");
      this.elements.undoButton()?.classList.remove("hidden");

      this.elements.communityPage()?.classList.add("hidden");
    }
  }
}
