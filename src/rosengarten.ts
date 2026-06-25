/// <reference types="@workadventure/iframe-api-typings" />
import { onReady, onEnterPopup } from "./lib";

const VIEWS: Record<string, string> = {
  "view-aare": "📸 Viewpoint\n\nBelow you, the Aare bends around the old town and its red rooftops glow in the sun. 🌉",
  "view-alps": "📸 Viewpoint\n\nOn a clear day the snowy Bernese Alps line the horizon — Eiger, Mönch and Jungfrau. 🏔️",
  "view-muenster": "📸 Viewpoint\n\nThe Münster spire rises above the old town — Switzerland's tallest cathedral. 🗼",
};

onReady(() => {
  for (const [area, text] of Object.entries(VIEWS)) onEnterPopup(area, text);
  console.log("Rosengarten ready");
});
