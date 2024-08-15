import UserInterface from "../interface/main";
import ChatHandler from "../network/live-chat";

async function loadHTML(target: string, url: string): Promise<void> {
  try {
    const response = await fetch(url, { cache: "no-cache" });
    const data = await response.text();
    const targetElement = document.getElementById(target);
    if (targetElement) {
      targetElement.innerHTML = data;
    } else {
      console.error(`Element with id "${target}" not found.`);
    }
  } catch (error) {
    return console.error("Error loading HTML:", error);
  }
}

const HTMLContent = [
  { id: "header", src: "src/components/header.html" },
  { id: "util-buttons", src: "src/components/buttons.html" },
  { id: "live-chat", src: "src/components/chat.html" },
];

Promise.all(HTMLContent.map((html) => loadHTML(html.id, html.src)))
  .then(() => {
    //Setup UI after all HTML injections
    new UserInterface().setupListeners_signin();
    new ChatHandler().setupListeners();
  })
  .catch((error) => console.error("Error loading all HTML content:", error));
