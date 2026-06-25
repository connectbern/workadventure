/// <reference types="@workadventure/iframe-api-typings" />
import { onReady, popup } from "./lib";

const WELCOME =
  "🚉 Welcome to Bern Central Station!\n\nThis is your arrival hub. You don't have to talk to anyone — feel free to just hang out and work until someone shows up. When you're ready, read the guide or wait at the Let's Talk desk. 💬";

onReady(() => {
  setTimeout(() => popup("welcomePopup", WELCOME, [{ label: "Thanks!", className: "success" }]), 1200);
  WA.room.area.onEnter("welcome").subscribe(() =>
    popup("welcomePopup", WELCOME, [{ label: "Thanks!", className: "success" }])
  );

  WA.room.area.onEnter("infodesk").subscribe(() =>
    popup(
      "infodeskPopup",
      "ℹ️ Getting started in the space",
      [
        { label: "What do I do here?", cb: () => popup("infodeskPopup", "Stay a while and work in the meantime — no camera or mic needed. When someone joins, you can chat if you like. 🧑‍💻") },
        { label: "Meeting people?", cb: () => popup("infodeskPopup", "Walk near someone to start a video bubble. Specific hours are set for German help, tourism tips and interest groups. 🗓️") },
        { label: "Explore Bern 🗺️", className: "primary", cb: () => popup("infodeskPopup", "Take the portal to the Connect Bern hub to visit all the city's landmarks and mini-games!") },
      ]
    )
  );

  WA.room.area.onEnter("lets-talk-sign").subscribe(() =>
    popup("lets-talk-signPopup", "💬 Let's Talk\n\nNeed help, or just want company? Wait in this corner — someone from Connect Bern will join you here. No camera required.")
  );

  console.log("Station ready");
});
