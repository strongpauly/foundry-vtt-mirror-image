import { MirrorImage } from "./MirrorImage.mjs";
const MACRO_VERSION = 1;
const MACRO_NAME = "ToggleMirrorImage";

Hooks.once('ready', async function(){
  window.MirrorImage = new MirrorImage();
  let macro = game.macros.getName(MACRO_NAME);
  if(!macro || macro.flags.version != MACRO_VERSION) {
     macro = await Macro.create({
        "name": MACRO_NAME,
        "type": "script",
        "img": "icons/svg/d20-grey.svg",
        "command": await fetch("modules/foundry-vtt-mirror-image/ToggleMacro.js").then(resp => resp.text()),
        "flags": {"version": MACRO_VERSION},
        "scope": "global",
        "permission": "NONE",
        "folder": null
      });
    game.macros.set(macro.name, macro);
  }
});