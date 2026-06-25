/// <reference types="@workadventure/iframe-api-typings" />
import { onReady, popup } from "./lib";

onReady(() => {
  // The bookshelves open websites natively (openWebsite area properties).
  // Paola is our helper "NPC" at the desk.
  WA.room.area.onEnter("paola").subscribe(() =>
    popup(
      "paolaPopup",
      "📚 Paola (Library helper)\n\n«Grüessech! Welcome to Bern. How can I help?»",
      [
        { label: "Where do I start?", cb: () => popup("paolaPopup", "Head to Central Station first for the welcome guide, then explore from the Connect Bern hub. 🚉") },
        { label: "Practice German?", cb: () => popup("paolaPopup", "Browse the shelves here — one desk opens a German dictionary. And join a German-questions hour in the space! 🇩🇪") },
        { label: "Just saying hi 👋", className: "success", cb: () => WA.chat.sendChatMessage("Paola waves back 👋") },
      ]
    )
  );
  console.log("Library ready");
});
