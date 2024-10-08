import Canvas from "../../canvas/canvas";
import SessionManager from "../../session";
import SocketHandler from "../../network/socket-handler";
import { CanvasState, Page } from "../../util/enums";
import Paint from "../../util/paint";
import PageElements from "./elements";
import UserInterface from "../main";
import { LoaderConstructor } from "../canvas-previews/loaders";

export default class EventListeners {
  private elements = new PageElements();

  listenViewArtists_Button() {
    this.elements.viewArtistsButton()?.addEventListener("click", () => {
      const artistsScreen = this.elements.artistsScreen();
      if (artistsScreen) artistsScreen.classList.toggle("opacity-0");
    });
  }

  listenBack_Button() {
    this.elements.backButton()?.addEventListener("click", () => {
      const session = SessionManager.getInstance();
      if (session.isArtistMode()) {
        session.setArtistMode(false);
        this.exitArtistMode();
      } else {
        session.setPage(Page.community);
        new UserInterface().updatePage();
      }
    });
  }

  listenColorPicker_KeyPress() {
    this.elements.colorPicker()?.addEventListener("input", (e: Event) => {
      const canvas = Canvas.getInstance();
      const target = e.target as HTMLInputElement;
      canvas.setColor(Paint.hexToRgb(target.value));
    });
  }

  listenColorPicker_Button(elementID: string) {
    for (let i = 0; i < Paint.keys.length; i++) {
      const btn = document.getElementById(`color-btn-${Paint.keys[i]}`);
      btn?.addEventListener("click", () => {
        const canvas = Canvas.getInstance();
        const artistMode = SessionManager.getInstance().isArtistMode();
        if (artistMode) {
          canvas.setColor(Paint.values[i].paint);
        }
        if (!artistMode) {
          const backdrop = document.getElementById(elementID);
          if (backdrop) {
            backdrop.style.background = `linear-gradient(to bottom, ${Paint.values[i].ui}, #000)`;
            document.documentElement.style.setProperty(
              "--dynamic-color",
              Paint.values[i].ui
            ); // Change the color to green
          }
        }
      });
    }
  }

  listenCreate_Button() {
    const createBtn = this.elements.createButton();
    const createBtn_comm = document.getElementById("create-btn-comm");

    createBtn?.addEventListener("click", this.createCanvasHandler);
    createBtn_comm?.addEventListener("click", this.createCanvasHandler);
  }

  private createCanvasHandler = () => {
    this.elements.canvasPage()?.classList.remove("hidden");
    const session = SessionManager.getInstance();
    this.startArtistMode(CanvasState.new);
    if (session.getPage() == Page.community) {
      session.setPage(Page.canvas);
      new UserInterface().updatePage();
      //initialize canvas if not already
      Canvas.getInstance();
    }
  };

  listenTag_Button() {
    this.elements.tagButton()?.addEventListener("click", () => {
      this.startArtistMode(CanvasState.edit);
    });
  }

  listenPageToggle() {
    const pageToggle = document.getElementById("page-toggler");
    if (pageToggle) {
      pageToggle.addEventListener("click", () => {
        new UserInterface().updatePage();
      });
    }
  }

  listenBegin_Button() {
    const beginButton = document.getElementById("begin-btn");
    beginButton?.addEventListener("click", () => {
      const input = document.getElementById(
        "custom-user-input"
      ) as HTMLInputElement;

      const session = SessionManager.getInstance();
      const ui = new UserInterface();

      //set username
      const customUsername = input.value;
      const userTag = document.getElementById("user-tag");
      if (userTag) {
        if (customUsername.length > 0) {
          session.setUsername(customUsername);
          userTag.textContent = customUsername;
          SocketHandler.getInstance()
            .getSocket()
            .emit("update-user", customUsername);
        }
      }

      //update UI
      const signInScreen = document.getElementById("sign-in");
      signInScreen?.classList.add("hidden");
      const canvasPage = document.getElementById("canvas-page");
      const setupLoader = document.getElementById("setup-loader-container");
      if (canvasPage) {
        canvasPage.classList.remove("hidden");
        setupLoader?.classList.remove("hidden");

        //ensure canvas is setup by introducing a delay
        const RENDER_DELAY = 800;
        setTimeout(() => {
          setupLoader?.classList.add("hidden");
          document.body.style.backgroundColor = "black";

          //ensures a new instance is initialized each time
          if (Canvas.hasInstance()) {
            console.log("resetting instance");
            Canvas.clearInstance();
          }
          Canvas.getInstance();
          ui.setupListeners_app();
        }, RENDER_DELAY);
      }
    });
  }

  listenCustomUser_Button() {
    const customizeUser = document.getElementById("customize-username");
    customizeUser?.addEventListener("click", () => {
      const input = document.getElementById("custom-user-input");
      const username = document.getElementById("generated-username");
      username?.classList.toggle("hidden");
      input?.classList.toggle("hidden");
    });
  }

  listenGenerateUser() {
    const button = this.elements.generateUserButton() as HTMLButtonElement;
    button?.addEventListener("click", () => {
      const input = document.getElementById("custom-user-input");
      input?.classList.add("hidden");
      const user_signIn = document.getElementById("user-signin");
      if (user_signIn) {
        user_signIn.innerHTML = LoaderConstructor.spinner;
      }
      SocketHandler.getInstance().getSocket().emit("generate-user");
      button.disabled = true;
    });
  }

  private startArtistMode(state: CanvasState) {
    const canvas = Canvas.getInstance();
    const session = SessionManager.getInstance();
    const viewArtistBtn = this.elements.viewArtistsButton();
    const previewButtons = this.elements.previewButtons();
    if (viewArtistBtn) {
      viewArtistBtn.classList.add("hidden");
    }
    if (previewButtons) {
      previewButtons.classList.add("hidden");
    }
    session.setArtistMode(true);
    this.elements.artistButtons()?.classList.remove("hidden");

    if (state == CanvasState.new) {
      canvas.clear();
      canvas.resetPaintStrokes();
    }
    canvas.startLoop();
  }

  private exitArtistMode() {
    const session = SessionManager.getInstance();
    const viewArtistBtn = this.elements.viewArtistsButton();
    const previewButtons = this.elements.previewButtons();
    if (viewArtistBtn) {
      viewArtistBtn.classList.remove("hidden");
    }
    if (previewButtons) {
      previewButtons.classList.remove("hidden");
    }
    session.setArtistMode(false);
    this.elements.artistButtons()?.classList.add("hidden");
  }

  //DEV ONLY ###################################################################################################//
  listenClear_Button() {
    this.elements.clearButton()?.addEventListener("click", () => {
      const canvas = Canvas.getInstance();
      SocketHandler.getInstance().getSocket().emit("clear");
      canvas.clear();
    });
  }
}
