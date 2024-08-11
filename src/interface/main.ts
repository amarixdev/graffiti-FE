import { Button, Previews } from "../util/enums";
import { ImagePreview } from "../util/types";

import ButtonHandler from "./handlers/button-handler";
import PageHandler from "./handlers/page-handler";
import EventListeners from "./global/listeners";
import PreviewConstructor from "./canvas-previews/previews";
import { LoaderConstructor } from "./canvas-previews/loaders";

export default class UserInterface {
  private buttons: ButtonHandler;
  private page: PageHandler;
  private listeners: EventListeners;
  private previewConstructor: PreviewConstructor;
  private loaderConstructor: LoaderConstructor;

  constructor() {
    this.buttons = new ButtonHandler();
    this.page = new PageHandler();
    this.listeners = new EventListeners();
    this.previewConstructor = new PreviewConstructor();
    this.loaderConstructor = new LoaderConstructor();
  }
  /*establish initial event listeners*/
  setupListeners(): void {
    this.listeners.listenColorPicker_Button("color-backdrop");
    this.listeners.listenColorPicker_Button("artist-container");
    this.listeners.listenColorPicker_KeyPress();
    this.listeners.listenTagButton();
    this.listeners.listenClearButton();
    this.listeners.listenPageToggle();
    this.listeners.listenViewArtists_Button();
  }

  updatePageUI(): void {
    this.page.updatePageUI();
  }

  saveBtn_toggle(button: Button): void {
    this.buttons.saveBtn_toggle(button);
  }

  undoBtn_toggle(button: Button): void {
    this.buttons.undoBtn_toggle(button);
  }

  display_CanvasLoader(id: string): void {
    this.loaderConstructor.display_CanvasLoader(id);
  }

  display_PreviewLoader(): void {
    this.loaderConstructor.display_Loader(null);
  }

  //render a loading view for updated canvas preview
  display_UpdateLoader(id: string): void {
    this.loaderConstructor.display_Loader(id);
  }

  //handles rendering for all newly added canvas previews; handles initial UI display
  renderPreviews(type: Previews): void {
    this.previewConstructor.render(type);
  }

  restorePreview(): void {
    this.previewConstructor.restore();
  }

  //handles updated canvas preview display
  updatePreview(preview: ImagePreview): void {
    this.previewConstructor.update(preview);
  }

  resetLoader(preview: HTMLDivElement): void {
    this.loaderConstructor.reset(preview);
  }
}
