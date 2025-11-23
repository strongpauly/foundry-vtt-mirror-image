const FILTER_ID = "images";
const SCOPE = "foundry-vtt-mirror-image";
const COUNT_KEY = "mirrorImageCount";
const BUTTONS_ID = "mirrorImageButtons";

function renderButton(numImages, isActive, maxImages) {
	return `<div id="mirrorImages${numImages}" class="control-icon${
		isActive ? " active" : ""
	}" style="margin-top:0px;overflow:hidden;" data-tooltip="${numImages} image${numImages === 1 ? "" : "s"}">
    <img src="icons/magic/defensive/illusion-evasion-echo-purple.webp" style="margin:0;filter:grayscale(${
		(1 - numImages / maxImages) * 100
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

		const maxImages = game.system.id === "pf1" ? 8 : 3;
		const imageCounts = new Array(maxImages).fill(null).map((_v, index) => index + 1);

		const parent = jQuery(".col.middle").first();
		parent.append(`<div id="${BUTTONS_ID}" class="mirror-image-buttons">
		${imageCounts.map((count) => renderButton(count, imagesLeft === count, maxImages)).join("")}
    </div>`);
		imageCounts.forEach((count) => {
			parent.on("click", `#mirrorImages${count}`, async () => {
				await document.setFlag(SCOPE, COUNT_KEY, count);
				await this.updateImages(token);
				imageCounts.forEach((other) => {
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
		if (!TokenMagic) {
			return;
		}
		const placeable = getPlaceable(token);
		const imagesLeft = placeable.document.getFlag(SCOPE, COUNT_KEY);
		try {
			const images = await TokenMagic.getPreset(FILTER_ID)[0];
			await TokenMagic.addUpdateFilters(placeable, [{ ...images, nbImage: imagesLeft + 1 }]);
		} catch (ex) {
			console.error(ex);
		}
	}

	async clearImages(placeable) {
		if (!TokenMagic) {
			return;
		}
		try {
			await TokenMagic.deleteFilters(placeable, FILTER_ID);
		} catch (ex) {
			console.error(ex);
		}
	}

	async on(token) {
		const placeable = getPlaceable(token);
		await placeable.document.setFlag(SCOPE, COUNT_KEY, 3);
		await Promise.all([
			// placeable.document.setFlag(SCOPE, UPDATE_LISTENER_KEY, Hooks.on('updateActor', updateListener)),
			this.renderHud(token, placeable.document),
			this.updateImages(token)
		]);
	}

	async off(token) {
		const placeable = getPlaceable(token);
		await Promise.all([placeable.document.unsetFlag(SCOPE, COUNT_KEY), this.clearImages(placeable)]);
		// Hooks.off('updateActor', placeable.document.getFlag(SCOPE, UPDATE_LISTENER_KEY))
		jQuery(`#${BUTTONS_ID}`).detach();
	}
}
