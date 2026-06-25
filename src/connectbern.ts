/// <reference types="@workadventure/iframe-api-typings" />
import { onReady, onEnterPopup, popup } from "./lib";

const SIGNS: Record<string, string> = {
  "sign-library": "📚 The Library — a quiet corner where Paola is often found, ready to answer your questions.",
  "sign-rosengarten": "🌹 Rosengarten — relax in the rose garden with a panoramic view over the old town.",
  "sign-station": "🚉 Bahnhof — the Welcome Hub. New here? Start at the info desk or the Let's Talk corner.",
  "sign-zytglogge": "🕰️ The Zytglogge — Bern's 13th-century clock tower. Step inside for a time puzzle.",
  "sign-parliament": "🏛️ Bundeshaus — the Swiss parliament. This is our meeting space: step in to start a call.",
  "sign-staying-in-bern": "🏠 Staying in Bern — volunteer info by day, a social space to meet people by night.",
  "sign-baerengraben": "🐻 Bärengraben — the bear pit, a Bern icon. Say hi to the bears and test your trivia.",
  "sign-oldtown": "🏰 Old Town & Münster — a UNESCO world heritage site. Try the treasure hunt!",
  "sign-aare-float": "🌊 Eichholz → Marzili — jump into the Aare and float downstream. A real Bern summer ritual!",
};

const WELCOME =
  "🐻 Welcome to Connect Bern!\n\nThis is the heart of the map. Walk up to any landmark for a description, then step onto a glowing tile to travel there. Explore — and say hi to anyone you meet!";

onReady(() => {
  // spawn is inside the welcome zone, so onEnter won't fire on arrival — show it once on init
  setTimeout(() => popup("welcomePopup", WELCOME, [{ label: "Let's go!", className: "success" }]), 1200);
  WA.room.area.onEnter("welcome").subscribe(() =>
    popup("welcomePopup", WELCOME, [{ label: "Let's go!", className: "success" }])
  );
  for (const [area, text] of Object.entries(SIGNS)) onEnterPopup(area, text);
  console.log("Connect Bern hub ready");
});
