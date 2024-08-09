import Canvas from "../../canvas/canvas";
import SessionManager from "../../session";
import SocketHandler from "../../socket-handler";
import { Page } from "../../util/enums";
import Paint from "../../util/paint";
import PageElements from "./elements";
import UserInterface from "../main";

export default class EventListeners {
  private elements = new PageElements();

  listenColorPicker_KeyPress() {
    const canvas = Canvas.getInstance();
    this.elements.colorPicker()?.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement;
      canvas.setColor(Paint.hexToRgb(target.value));
    });
  }

  listenColorPicker_Button() {
    const canvas = Canvas.getInstance();
    for (let i = 0; i < Paint.keys.length; i++) {
      const btn = document.getElementById(`color-btn-${Paint.keys[i]}`);
      btn?.addEventListener("click", () => {
        const currentPage = SessionManager.getInstance().getPage();
        if (currentPage == Page.canvas) {
          canvas.setColor(Paint.values[i].paint);
        }
        if (currentPage == Page.community) {
          const backdrop = document.getElementById("color-backdrop");
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

  listenTagButton() {
    const canvas = Canvas.getInstance();
    this.elements.tagButton()?.addEventListener("click", () => {
      SessionManager.getInstance().setArtistMode(true);
      canvas.startLoop();
      new UserInterface().updatePageUI();
    });
  }

  //DEV ONLY ###################################################################################################//
  listenClearButton() {
    const canvas = Canvas.getInstance();
    this.elements.clearButton()?.addEventListener("click", () => {
      SocketHandler.getInstance().getSocket().emit("clear");
      canvas.clear();
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  listenPageToggle() {
    const pageToggle = document.getElementById("page-toggler");
    if (pageToggle) {
      pageToggle.addEventListener("click", () => {
        new UserInterface().updatePageUI();
      });
    }
  }
}
