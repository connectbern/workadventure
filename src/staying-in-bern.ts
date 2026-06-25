/// <reference types="@workadventure/iframe-api-typings" />
import { onReady, popup } from "./lib";

const ROOMS: Record<string, { title: string; text: string }> = {
  kitchen: {
    title: "🍳 Kitchen",
    text: "🍳 Kitchen guidelines\n\n• Clean up after yourself.\n• Label food in the fridge.\n• Coffee is free — refill the machine when empty ☕\n\nPlease confirm you've read this.",
  },
  bathroom: {
    title: "🚿 Bathroom",
    text: "🚿 Bathroom guidelines\n\n• Keep it tidy for the next person.\n• Tell a coordinator if supplies run low.\n• Hot water takes a moment 🚿\n\nPlease confirm you've read this.",
  },
  living: {
    title: "🛋️ Living room",
    text: "🛋️ Living room\n\nThis is the shared social space. Be welcoming, keep the volume friendly, and feel free to start a conversation with anyone here 🥳\n\nPlease confirm you've read this.",
  },
};

onReady(() => {
  // Day/night: the dark "night" layer is hidden by default (= day).
  let night = false;
  WA.room.hideLayer("night");

  const read = new Set<string>();
  for (const [area, info] of Object.entries(ROOMS)) {
    WA.room.area.onEnter(area).subscribe(() =>
      popup(area + "Popup", info.text, [
        {
          label: read.has(area) ? "✓ Read" : "I've read this ✅",
          className: "success",
          cb: () => { read.add(area); WA.chat.sendChatMessage(`✅ ${info.title} guidelines confirmed.`); },
        },
      ])
    );
  }

  WA.room.area.onEnter("lightswitch").subscribe(() => {
    night = !night;
    if (night) { WA.room.showLayer("night"); WA.chat.sendChatMessage("🌙 Night mode — cosy time."); }
    else { WA.room.hideLayer("night"); WA.chat.sendChatMessage("🌞 Day mode — good morning!"); }
  });

  console.log("Staying in Bern ready");
});
