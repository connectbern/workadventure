import{o as t,p as i}from"./lib-00b1ca0a.js";import"./init-ad207eca.js";t(()=>{let a=0;const e=new Set,r=6;WA.room.area.onEnter("eichholz").subscribe(()=>{a||(a=Date.now(),e.clear(),WA.ui.displayActionMessage({message:"🏊 You jumped in at Eichholz! Float down to Marzili and grab the ducks 🦆",callback:()=>{}}))});for(let o=0;o<r;o++)WA.room.area.onEnter("duck"+o).subscribe(()=>{a&&!e.has("d"+o)&&(e.add("d"+o),WA.chat.sendChatMessage(`🦆 Duck ${e.size}/${r} collected!`))});WA.room.area.onEnter("marzili").subscribe(()=>{if(!a)return;const o=Math.round((Date.now()-a)/1e3),s=e.size===r?"⭐⭐⭐ Perfect float!":e.size>=4?"⭐⭐ Nice!":"⭐ Try again for more ducks!";i("marziliPopup",`🏁 You reached Marzili!

⏱️ Time: ${o}s
🦆 Ducks: ${e.size}/${r}
${s}`,[{label:"Float again",className:"primary",cb:()=>{a=0,e.clear(),WA.player.teleport(464,56)}},{label:"Done",className:"normal"}]),a=0}),console.log("Aare Float ready")});
//# sourceMappingURL=aare-float-4bb0a38d.js.map
