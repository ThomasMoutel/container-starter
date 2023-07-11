import type { PlatformContextGroups, PlatformContextGroup } from "./shapes";

export const CONTAINER_ID = "layout-container";
const openfinWindow: OpenFin.Window = fin.Window.getCurrentSync();
const openfinApplication: OpenFin.Application = fin.Application.getCurrentSync();

let lastFocusedView: OpenFin.Identity;

openfinApplication
	.on("view-focused", (viewEvent): void => {
		lastFocusedView = viewEvent.viewIdentity;
	})
	.catch((error) => console.error(error));

/**
 * @function changeContextGroup
 * @param event - DOM click event that is passed in to the button click event from `addContextGroupButtons` local `newButton` variable
 * @description
 * Joins a context group by passing in the top-level variable `lastFocusedView` as the `target` parameter of the `joinContextGroup` function.
 */

async function changeContextGroup(event: Event): Promise<void> {
	const selectedColorElement: HTMLElement = event.target as HTMLElement;
	const color: string = selectedColorElement.title;
	await fin.me.interop.joinContextGroup(color, lastFocusedView);
	const contextGroups: PlatformContextGroups = await fin.me.interop.getContextGroups();
	const focusedTab = document.querySelector(`#tab-${lastFocusedView.name}`);
	if (focusedTab) {
		focusedTab.classList.remove(
			...contextGroups.map(({ displayMetadata }: PlatformContextGroup) => `${displayMetadata?.name}-channel`)
		);
	}
	const focusedView = document.querySelector(`#tab-${lastFocusedView.name}`);
	if (focusedView) {
		focusedView.classList.add(`${color}-channel`);
	}
}

/**
 * @function addContextGroupButtons
 * @description
 * 1. Retrieves a Platform's interop context groups.
 * 2. Iterates all context groups and creates a corresponding button per context group (color channel).
 * 3. Adds a click listener to each button with the `changeContextGroup` function as the listener callback.
 */
async function addContextGroupButtons(): Promise<void> {
	const contextGroups: PlatformContextGroups = await fin.me.interop.getContextGroups();
	const windowFrameStyleSheet: CSSStyleSheet = document.styleSheets[0];
	const buttonsWrapper = document.querySelector<HTMLElement>("#buttons-wrapper");
	if (buttonsWrapper) {
		for (const systemChannel of contextGroups) {
			const nm = systemChannel.displayMetadata?.name;
			const col = systemChannel.displayMetadata?.color;
			if (nm && col) {
				windowFrameStyleSheet.insertRule(`.${nm}-channel { border-left: 2px solid ${col} !important;}`);
				windowFrameStyleSheet.insertRule(`#${nm}-button:after { background-color: ${col}}`);
				const newButton = document.createElement("div");
				newButton.classList.add("button");
				newButton.classList.add("channel-button");
				newButton.id = `${nm}-button`;
				newButton.title = nm;
				newButton.addEventListener("click", changeContextGroup);
				buttonsWrapper.prepend(newButton);
			}
		}
	}
}

async function maxOrRestore(): Promise<void> {
	if ((await openfinWindow.getState()) === "normal") {
		return openfinWindow.maximize();
	}

	return openfinWindow.restore();
}

async function closeWindow(): Promise<void> {
	return openfinWindow.close();
}

async function minimizeWindow(): Promise<void> {
	return openfinWindow.minimize();
}

async function setupTitleBar(): Promise<void> {
	const title = document.querySelector("#title");
	const minBtn = document.querySelector("#minimize-button");
	const maxBtn = document.querySelector("#expand-button");
	const closeBtn = document.querySelector("#close-button");

	if (title && minBtn && maxBtn && closeBtn) {
		title.innerHTML = fin.me.identity.uuid;

		minBtn.addEventListener("click", minimizeWindow);
		maxBtn.addEventListener("click", maxOrRestore);
		closeBtn.addEventListener("click", closeWindow);
	}

	await addContextGroupButtons();
}

window.addEventListener("DOMContentLoaded", async () => {
	await fin.Platform.Layout.init({ containerId: CONTAINER_ID });
	await setupTitleBar();
});
