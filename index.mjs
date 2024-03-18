import { MirrorImage } from "./MirrorImage.mjs";
const MACROS = [
  {
    name: "ToggleMirrorImage",
    src: "modules/foundry-vtt-mirror-image/macros/ToggleMacro.js",
    version: 2,
    img: "icons/magic/defensive/illusion-evasion-echo-purple.webp",
  },
  {
    name: "MirrorImageOn",
    src: "modules/foundry-vtt-mirror-image/macros/OnMacro.js",
    version: 1,
    img: "icons/magic/defensive/illusion-evasion-echo-purple.webp",
  },
  {
    name: "MirrorImageOff",
    src: "modules/foundry-vtt-mirror-image/macros/OffMacro.js",
    version: 1,
    img: "icons/magic/defensive/illusion-evasion-echo-purple.webp",
  },
];

async function getMacroData(meta) {
  return {
    name: meta.name,
    command: await fetch(meta.src).then((resp) => resp.text()),
    img: meta.img,
    flags: { version: meta.version },
  };
}

Hooks.once("ready", async function () {
  window.MirrorImage = new MirrorImage();
  for (const macroMeta of MACROS) {
    const { name, version } = macroMeta;
    let macro = game.macros.getName(name);
    const macroData = await getMacroData(macroMeta);
    if (!macro) {
      console.log(`Creating macro ${name}`);
      macro = await Macro.create(
        Object.assign(
          {
            type: "script",
            scope: "global",
            permission: "NONE",
            folder: null,
          },
          macroData
        )
      );
    } else if (macro.flags?.version !== version) {
      console.log(`Updating macro ${name} to ${version}`);
      await macro.update(macroData);
    }
  }
});
