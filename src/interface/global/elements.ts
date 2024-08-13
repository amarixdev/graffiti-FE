export default class PageElements {
  private COLOR_PICKER: HTMLElement | null =
    document.getElementById("color-picker");
  private SAVE_BTN: HTMLElement | null = document.getElementById("save-btn");
  private SAVE_BTN_CONTAINER: HTMLElement | null =
    document.getElementById("save-btn-container");
  private CLEAR_BTN: HTMLElement | null = document.getElementById("clear-btn");
  private UNDO_BTN: HTMLElement | null = document.getElementById("undo-btn");
  private COMMUNITY_PAGE: HTMLElement | null = document.getElementById(
    "community-container"
  );
  private CANVAS_CONTAINER: HTMLElement | null =
    document.getElementById("canvas-container");
  private COMMUNITY_GRID: HTMLElement | null =
    document.getElementById("community-grid");
  private TAG_BTN: HTMLElement | null = document.getElementById("tag-button");
  private ARTIST_BTN: HTMLElement | null =
    document.getElementById("artist-buttons");

  private CANVAS_PAGE: HTMLElement | null =
    document.getElementById("canvas-page");

  private VIEW_ARTISTS_BTN: HTMLElement | null =
    document.getElementById("view-artists-btn");

  private ARTISTS_SCREEN: HTMLElement | null =
    document.getElementById("artists-screen");

  private PREVIEW_BUTTONS: HTMLElement | null =
    document.getElementById("preview-buttons");

  private CREATE_BUTTON: HTMLElement | null =
    document.getElementById("create-btn");

  private BACK_BUTTON: HTMLElement | null = document.getElementById("back-btn");

  artistsScreen() {
    return this.ARTISTS_SCREEN;
  }

  backButton() {
    return this.BACK_BUTTON;
  }

  createButton() {
    return this.CREATE_BUTTON;
  }

  previewButtons() {
    return this.PREVIEW_BUTTONS;
  }

  viewArtistsButton() {
    return this.VIEW_ARTISTS_BTN;
  }
  colorPicker() {
    return this.COLOR_PICKER;
  }
  saveButton() {
    return this.SAVE_BTN;
  }

  saveButtonContainer() {
    return this.SAVE_BTN_CONTAINER;
  }
  clearButton() {
    return this.CLEAR_BTN;
  }
  undoButton() {
    return this.UNDO_BTN;
  }

  communityPage() {
    return this.COMMUNITY_PAGE;
  }
  communityGrid() {
    return this.COMMUNITY_GRID;
  }
  canvasContainer() {
    return this.CANVAS_CONTAINER;
  }
  tagButton() {
    return this.TAG_BTN;
  }
  artistButtons() {
    return this.ARTIST_BTN;
  }
  canvasPage() {
    console.log(this.CANVAS_PAGE);
    return this.CANVAS_PAGE;
  }

  init_saveButtonContainer() {
    this.SAVE_BTN_CONTAINER = document.getElementById("save-btn-container");
  }

  init_saveButton() {
    this.SAVE_BTN = document.getElementById("save-btn");
  }

  init_undoButton() {
    this.UNDO_BTN = document.getElementById("undo-btn");
  }
}
