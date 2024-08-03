import Interface from "./interface";
import ChatHandler from "./live-chat";
import SocketHandler from "./socket-handler";
import { Page } from "./util/enums";
import { ImagePreviews } from "./util/types";

export default class SessionManager {
  private currentPage: Page = Page.canvas;
  private socketHandler: SocketHandler;
  private tagPreviews: ImagePreviews[] = new Array();
  private static instance: SessionManager;
  private constructor() {
    console.log("session initialized");
    this.socketHandler = SocketHandler.getInstance();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  setUp() {
    this.socketHandler.setUpListeners();
    new Interface().setup();
    new ChatHandler().setup();
  }

  setPage(page: Page) {
    this.currentPage = page;
  }

  getPage() {
    return this.currentPage;
  }
  setTagPreviews(tagPreviews: ImagePreviews[]) {
    this.tagPreviews = tagPreviews;
  }
  //used for rendering canvas previews
  getTagPreviews() {
    return this.tagPreviews;
  }
}

SessionManager.getInstance().setUp();
