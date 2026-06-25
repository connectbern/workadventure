/// <reference types="@workadventure/iframe-api-typings" />
import { onReady, popup } from "./lib";

onReady(() => {
  let started = 0;
  const ducks = new Set<string>();
  const TOTAL = 6;

  WA.room.area.onEnter("eichholz").subscribe(() => {
    if (!started) {
      started = Date.now();
      ducks.clear();
      WA.ui.displayActionMessage({
        message: "🏊 You jumped in at Eichholz! Float down to Marzili and grab the ducks 🦆",
        callback: () => {},
      });
    }
  });

  for (let i = 0; i < TOTAL; i++) {
    WA.room.area.onEnter("duck" + i).subscribe(() => {
      if (started && !ducks.has("d" + i)) {
        ducks.add("d" + i);
        WA.chat.sendChatMessage(`🦆 Duck ${ducks.size}/${TOTAL} collected!`);
      }
    });
  }

  WA.room.area.onEnter("marzili").subscribe(() => {
    if (!started) return;
    const secs = Math.round((Date.now() - started) / 1000);
    const stars = ducks.size === TOTAL ? "⭐⭐⭐ Perfect float!" : ducks.size >= 4 ? "⭐⭐ Nice!" : "⭐ Try again for more ducks!";
    popup(
      "marziliPopup",
      `🏁 You reached Marzili!\n\n⏱️ Time: ${secs}s\n🦆 Ducks: ${ducks.size}/${TOTAL}\n${stars}`,
      [
        { label: "Float again", className: "primary", cb: () => { started = 0; ducks.clear(); WA.player.teleport(464, 56); } },
        { label: "Done", className: "normal" },
      ]
    );
    started = 0;
  });

  console.log("Aare Float ready");
});
