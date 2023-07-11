export {};

document.addEventListener("DOMContentLoaded", init);

function init(): void {
	const showPopupButton = document.querySelector("#btn-show-popup");
	if (showPopupButton) {
		showPopupButton.addEventListener("click", createPopupWindow);
	}
}

async function createPopupWindow(): Promise<void> {
	const PARENT_FRAME_OFFSET = 64;
	resetPopupResult();
	const parentWindow = await (fin.me as OpenFin.View).getCurrentWindow();
	const { identity: modalParentIdentity } = parentWindow;
	const parentBounds = await parentWindow.getBounds();
	const qHeight = parentBounds.height / 4;
	const result = await fin.me.showPopupWindow({
		initialOptions: {
			modalParentIdentity
		},
		url: location.href.replace("app", "popup"),
		x: Math.floor(parentBounds.width / 8),
		y: Math.floor(parentBounds.height / 8) - PARENT_FRAME_OFFSET,
		height: Math.floor(parentBounds.height - qHeight),
		width: Math.floor(parentBounds.width - qHeight),
		blurBehavior: "modal"
	});
	renderPopupResult(result);
}

function renderPopupResult(result: OpenFin.PopupResult): void {
	const res = document.querySelector("#popup-result");
	if (res) {
		res.textContent = JSON.stringify(result, undefined, 2);
	}
}

function resetPopupResult(): void {
	const res = document.querySelector("#popup-result");
	if (res) {
		res.textContent = "No result";
	}
}
