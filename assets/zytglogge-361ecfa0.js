import{o as n,p as r}from"./lib-00b1ca0a.js";import"./init-ad207eca.js";n(()=>{WA.room.area.onEnter("clock").subscribe(()=>{const e=new Date,a=e.getHours().toString().padStart(2,"0")+":"+e.getMinutes().toString().padStart(2,"0");r("clockPopup",`🕰️ The Zytglogge

It is ${a}.

Legend says the tower opens its vault only to those who walk the hours in order: 1 → 2 → 3.`)});const o=[1,2,3];let t=0,s=!1;for(const e of o)WA.room.area.onEnter("hour"+e).subscribe(()=>{s||(e===o[t]?(t++,t===o.length?(s=!0,WA.chat.sendChatMessage("🔓 The vault clicks open!")):WA.chat.sendChatMessage(`✅ Hour ${e}… ${t}/3`)):(t=0,WA.chat.sendChatMessage("❌ Wrong hour — the gears reset. Start at 1.")))});WA.room.area.onEnter("vault").subscribe(()=>{s?r("vaultPopup",`🏆 The Vault

You solved the Zytglogge! Inside you find the secret of Bern: time spent with good people is never wasted. ⏳🐻`,[{label:"✨ Nice",className:"success"}]):r("vaultPopup",`🔒 The vault is locked.

Step on the hour-plates in order: 1 → 2 → 3.`)}),console.log("Zytglogge puzzle ready")});
//# sourceMappingURL=zytglogge-361ecfa0.js.map
