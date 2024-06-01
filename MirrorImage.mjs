const FILTER_ID = "images";
const SCOPE = "foundry-vtt-mirror-image";
const COUNT_KEY = "mirrorImageCount";
const BUTTONS_ID = "mirrorImageButtons";

function renderButton(numImages, isActive) {
  return `<div id="mirrorImages${numImages}" class="control-icon${
    isActive ? " active" : ""
  }" style="margin-top:0px;overflow:hidden;" data-tooltip="${numImages} image${
    numImages === 1 ? "" : "s"
  }">
    <img src="icons/magic/defensive/illusion-evasion-echo-purple.webp" style="margin:0;filter:grayscale(${
      (1 - numImages / 3) * 100
    }%);"/>
</div>`;
}

// async function updateListener(actor, change) {
//     if(actor.id === token.actor.id) {
//         if(typeof change.flags?.[SCOPE]?.[COUNT_KEY] === 'number') {
//             await updateImages(token)
//         }
//     }
// }

function getPlaceable(token) {
  return token.document ? token : token.object;
}

export class MirrorImage {
  constructor() {
    Hooks.on("renderTokenHUD", (token) => {
      const placeable = getPlaceable(token);
      const imageCount = placeable.document.getFlag(SCOPE, COUNT_KEY);
      if (typeof imageCount === "number") {
        this.renderHud(token, placeable.document);
      }
    });
  }

  async renderHud(hud, document) {
    const token = hud.object;
    const imagesLeft = document.flags[SCOPE][COUNT_KEY];
    const middle = jQuery(".col.middle").first();
    middle.append(`<div id="${BUTTONS_ID}" style="display:flex;position:absolute;bottom:-65px;align-items:center;gap:12px">
        ${renderButton(1, imagesLeft === 1)}
        ${renderButton(2, imagesLeft === 2)}
        ${renderButton(3, imagesLeft === 3)}
    </div>`);
    [1, 2, 3].forEach((count) => {
      middle.on("click", `#mirrorImages${count}`, async () => {
        await document.setFlag(SCOPE, COUNT_KEY, count);
        await this.updateImages(token);
        [1, 2, 3].forEach((other) => {
          if (other === count) {
            jQuery(`#mirrorImages${other}`).addClass("active");
          } else {
            jQuery(`#mirrorImages${other}`).removeClass("active");
          }
        });
      });
    });
  }

  async updateImages(token) {
    const placeable = getPlaceable(token);
    const imagesLeft = placeable.document.getFlag(SCOPE, COUNT_KEY);
    const images = await TokenMagic.getPreset(FILTER_ID)[0];
    await TokenMagic.addUpdateFilters(placeable, [
      { ...images, nbImage: imagesLeft + 1 },
    ]);
  }

  async on(token) {
    const placeable = getPlaceable(token);
    await placeable.document.setFlag(SCOPE, COUNT_KEY, 3);
    await Promise.all([
      // placeable.document.setFlag(SCOPE, UPDATE_LISTENER_KEY, Hooks.on('updateActor', updateListener)),
      this.renderHud(token, placeable.document),
      this.updateImages(token),
    ]);
  }

  async off(token) {
    const placeable = getPlaceable(token);
    await Promise.all([
      placeable.document.unsetFlag(SCOPE, COUNT_KEY),
      TokenMagic.deleteFilters(placeable, FILTER_ID),
    ]);
    // Hooks.off('updateActor', placeable.document.getFlag(SCOPE, UPDATE_LISTENER_KEY))
    jQuery(`#${BUTTONS_ID}`).detach();
  }
}
