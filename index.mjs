import { MirrorImage } from "./MirrorImage.mjs";
const MACRO_VERSION = 2;
const MACRO_NAME = "ToggleMirrorImage";

async function getMacroData() {
  return {
    "name": MACRO_NAME,
    "command": await fetch("modules/foundry-vtt-mirror-image/ToggleMacro.js").then(resp => resp.text()),
    "img": "icons/magic/defensive/illusion-evasion-echo-purple.webp",
    "flags": {"version": MACRO_VERSION}
  }
}

Hooks.once('ready', async function(){
  window.MirrorImage = new MirrorImage();
  let macro = game.macros.getName(MACRO_NAME);
  const macroData = await getMacroData();
  if(!macro) {
    console.log(`Creating macro ${MACRO_NAME}`);
    macro = await Macro.create(Object.assign({
      "type": "script",
      "scope": "global",
      "permission": "NONE",
      "folder": null
    }, macroData));
  } else if(macro.flags?.version !== MACRO_VERSION) {
    console.log(`Updating macro ${MACRO_NAME} to ${MACRO_VERSION}`);
    macro = Object.assign(macro, macroData)
  }
  game.macros.set(macro.name, macro);
});