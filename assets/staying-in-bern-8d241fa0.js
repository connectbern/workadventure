import{o as i,p as a}from"./lib-00b1ca0a.js";import"./init-ad207eca.js";const r={kitchen:{title:"🍳 Kitchen",text:`🍳 Kitchen guidelines

• Clean up after yourself.
• Label food in the fridge.
• Coffee is free — refill the machine when empty ☕

Please confirm you've read this.`},bathroom:{title:"🚿 Bathroom",text:`🚿 Bathroom guidelines

• Keep it tidy for the next person.
• Tell a coordinator if supplies run low.
• Hot water takes a moment 🚿

Please confirm you've read this.`},living:{title:"🛋️ Living room",text:`🛋️ Living room

This is the shared social space. Be welcoming, keep the volume friendly, and feel free to start a conversation with anyone here 🥳

Please confirm you've read this.`}};i(()=>{let t=!1;WA.room.hideLayer("night");const o=new Set;for(const[e,n]of Object.entries(r))WA.room.area.onEnter(e).subscribe(()=>a(e+"Popup",n.text,[{label:o.has(e)?"✓ Read":"I've read this ✅",className:"success",cb:()=>{o.add(e),WA.chat.sendChatMessage(`✅ ${n.title} guidelines confirmed.`)}}]));WA.room.area.onEnter("lightswitch").subscribe(()=>{t=!t,t?(WA.room.showLayer("night"),WA.chat.sendChatMessage("🌙 Night mode — cosy time.")):(WA.room.hideLayer("night"),WA.chat.sendChatMessage("🌞 Day mode — good morning!"))}),console.log("Staying in Bern ready")});
//# sourceMappingURL=staying-in-bern-8d241fa0.js.map
