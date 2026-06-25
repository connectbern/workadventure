/// <reference types="@workadventure/iframe-api-typings" />
import { onReady, popup } from "./lib";

onReady(() => {
  WA.room.area.onEnter("podium").subscribe(() =>
    popup(
      "podiumPopup",
      "🏛️ The Voting Podium\n\nYou have the floor. Call a motion and cast your vote:",
      [
        { label: "👍 Aye", className: "success", cb: () => WA.chat.sendChatMessage("🗳️ You voted AYE on the motion. ✅") },
        { label: "👎 Nay", className: "error", cb: () => WA.chat.sendChatMessage("🗳️ You voted NAY on the motion. ❌") },
        { label: "🤝 Abstain", className: "normal", cb: () => WA.chat.sendChatMessage("🗳️ You abstained.") },
      ]
    )
  );
  console.log("Parliament ready");
});
