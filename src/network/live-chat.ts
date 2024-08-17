import SocketHandler from "./socket-handler";
import { SocketType } from "../util/enums";
import SessionManager from "../session";

export default class ChatHandler {
  chatInput = document.getElementById("chat-input") as HTMLInputElement;
  chatForm = document.getElementById("chat-form");
  chatLog = document.getElementById("chat-log");
  chatContainer = document.getElementById("chat-container");

  setupListeners() {
    const socket = SocketHandler.getInstance();
    this.chatForm?.addEventListener("submit", (e) => {
      const user = SessionManager.getInstance().getUsername();
      if (user) {
        e.preventDefault();
        let message = this.chatInput.value;
        if (message) {
          socket.getSocket().emit("chat", message, user);
          this.addMessage(message, SocketType.user, user);
          this.chatInput.value = "";
        }
      }
    });
  }

  //add message bubble
  addMessage(message: string, type: SocketType, user: string) {
    // Create the container div
    const newMessage = document.createElement("div");
    newMessage.className = "chat-bubble";

    // Set the background color based on the message type
    if (type === SocketType.remote) {
      newMessage.style.backgroundColor = "#4b4b4b"; // Apply background color directly
    } else if (type === SocketType.user) {
      newMessage.style.backgroundColor = "#2a92e8"; // Apply background color directly
      newMessage.style.transform = "translateX(30%)"; 
    }

    // Create the user paragraph
    const userBubble = document.createElement("p");
    userBubble.className = "user";
    userBubble.textContent = user;
    this.formatFontSize(userBubble);

    // Create the message paragraph
    const remoteBubble = document.createElement("p");
    remoteBubble.className = "message";
    remoteBubble.textContent = message;
    this.formatFontSize(remoteBubble);

    // Append paragraphs to the container span
    newMessage.appendChild(userBubble);
    newMessage.appendChild(remoteBubble);

    // Insert the new message as the first child
    this.chatLog?.insertBefore(newMessage, this.chatLog.firstChild);
  }
  private formatFontSize(element: HTMLDivElement) {
    Object.assign(element.style, {
      fontSize: "0.85rem", // default size
    });

    if (window.matchMedia("(min-width: 1536px)").matches) {
      // 2xl
      Object.assign(element.style, {
        fontSize: "1.0rem", // Tailwind's lg
      });
    }

    if (window.matchMedia("(min-width: 1920px)").matches) {
      // 3xl
      Object.assign(element.style, {
        fontSize: "1.125rem", // Tailwind's xl
      });
    }

    if (window.matchMedia("(min-width: 2560px)").matches) {
      // 4xl
      Object.assign(element.style, {
        fontSize: "1.25rem", // Tailwind's 2xl
      });
    }

    if (window.matchMedia("(min-width: 3200px)").matches) {
      // 5xl
      Object.assign(element.style, {
        fontSize: "1.5rem", // Tailwind's 3xl
      });
    }
  }
}
