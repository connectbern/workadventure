import{o,p as a}from"./lib-00b1ca0a.js";import"./init-ad207eca.js";o(()=>{WA.room.area.onEnter("podium").subscribe(()=>a("podiumPopup",`🏛️ The Voting Podium

You have the floor. Call a motion and cast your vote:`,[{label:"👍 Aye",className:"success",cb:()=>WA.chat.sendChatMessage("🗳️ You voted AYE on the motion. ✅")},{label:"👎 Nay",className:"error",cb:()=>WA.chat.sendChatMessage("🗳️ You voted NAY on the motion. ❌")},{label:"🤝 Abstain",className:"normal",cb:()=>WA.chat.sendChatMessage("🗳️ You abstained.")}])),console.log("Parliament ready")});
//# sourceMappingURL=parliament-5013b1d3.js.map
