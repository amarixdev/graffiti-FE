import Canvas from "./canvas/canvas";
import SocketHandler from "./network/socket-handler";
import { Page } from "./util/enums";
import { ImageFile, ImagePreview } from "./util/types";

export default class SessionManager {
  private static instance: SessionManager;
  private username: string | null = null;
  private currentPage: Page = Page.community;
  private socketHandler: SocketHandler;
  private tagPreviews: Set<ImagePreview>;
  private tagPreviews_map: Map<
    string,
    { artists: string[] | null; img: ImageFile }
  >;
  private lastPreviewAddedID: string = "";
  private artistMode: boolean = true;
  private previewRef: HTMLElement | null = null;

  private constructor() {
    console.log("session initialized");
    this.socketHandler = SocketHandler.getInstance();
    this.tagPreviews = new Set();
    this.tagPreviews_map = new Map();
    console.log(this.tagPreviews);
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  setUsername(user: string): void {
    this.username = user;
    console.log("username set: " + user);
  }

  getUsername(): string | null {
    return this.username;
  }
  //set the ID of the canvas the user is viewing
  setPreviewRef(ref: HTMLElement | null): void {
    this.previewRef = ref;
  }
  //returns the ID of the canvas the user is viewing
  getPreviewRef(): HTMLElement | null {
    return this.previewRef;
  }

  isArtistMode(): boolean {
    return this.artistMode;
  }

  setArtistMode(bool: boolean): void {
    this.artistMode = bool;
  }

  setUp() {
    this.socketHandler.setupListeners();
  }

  setPage(page: Page) {
    this.currentPage = page;
  }

  getPage() {
    return this.currentPage;
  }

  setTagPreviews_map(
    tagPreviews: Map<string, { artists: string[] | null; img: ImageFile }>
  ) {
    this.tagPreviews_map = tagPreviews;
  }

  insertTagPreview_map(
    id: string,
    artists: string[] | null,
    imageFile: ImageFile
  ) {
    console.log(this.tagPreviews_map);
    this.tagPreviews_map.set(id, { artists: artists, img: imageFile });
    this.lastPreviewAddedID = id;
  }

  getTagPreviews_map() {
    return this.tagPreviews_map;
  }

  getLastAddedPreview_(): Map<
    string,
    { artists: string[] | null; img: ImageFile }
  > {
    const map = new Map();
    map.set(
      this.lastPreviewAddedID,
      this.tagPreviews_map.get(this.lastPreviewAddedID)
    );
    return map;
  }

  deletePreview(id: string) {
    this.tagPreviews_map.delete(id);
  }
}
window.onload = () => {
  Canvas.clearInstance();
};
SessionManager.getInstance().setUp();
