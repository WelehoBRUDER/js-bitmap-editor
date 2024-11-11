class WindowController {
	constructor() {
		this.holding = false;
	}
	/**
	 *
	 * @param {HTMLElement} content - HTML element housing all displayable content on the window
	 * @param {*} options - Possible options:
	 *  - `canIgnore` {boolean} - If enabled, this option makes the default close button unusable.
	 *  - `uniqueID` {string} - A unique ID for the window; only one instance can exist at any one time.
	 * 	-	`resize` {boolean} - If enabled, this option makes the window resizable
	 * 	- `onResize` {callback} - Callback function for the resize event
	 * @returns {void}
	 */
	create(content, options) {
		if (!content) return console.error("This window doesn't have any content! (Missing content HTMLElement from parameters)");
		const id = options?.uniqueID;
		if (id && this.findWindow(id)) return console.warn(`Window with id ${id} already exists.`);
		const popUpWindow = document.createElement("div");
		const closeButton = document.createElement("div");
		const drag = document.createElement("div");
		popUpWindow.classList.add("pop-up-window");
		closeButton.classList.add("close-button", options?.canIgnore ? "." : "unavailable");
		drag.classList.add("drag");
		if (id) {
			popUpWindow.id = id;
		}
		closeButton.textContent = "x";
		closeButton.addEventListener("click", () => {
			popUpWindow.remove();
			tooltip.hide();
		});
		content.classList.add("content");
		popUpWindow.append(drag, closeButton, content);
		document.body.append(popUpWindow);
		if (options?.resize) {
			popUpWindow.addEventListener("mousedown", (e) => {
				this.holding = true;
			});
			popUpWindow.addEventListener("mouseup", (e) => {
				this.holding = false;
			});
			popUpWindow.addEventListener("mousemove", (e) => {
				popUpWindow.style.cursor = "default";
				const { offsetX: x, offsetY: y } = e;
				// south-west
				if (x <= 0 && y >= -4 && y <= 0) {
					popUpWindow.style.cursor = "nwse-resize";
					console.log("north-west");
				}
				// south-west
				else if (x <= 0 && y >= popUpWindow.offsetHeight - 10 && y <= popUpWindow.offsetHeight + 4) {
					popUpWindow.style.cursor = "nesw-resize";
					console.log("south-west");
				} else if (x >= popUpWindow.offsetWidth - 10 && y >= popUpWindow.offsetHeight - 10 && y <= popUpWindow.offsetHeight + 4) {
					popUpWindow.style.cursor = "nwse-resize";
					console.log("south-east");
				}
				// north-east
				else if (x >= popUpWindow.offsetWidth - 10 && y >= -4 && y <= 0) {
					popUpWindow.style.cursor = "nesw-resize";
					console.log("north-east");
				} else if (x <= 0 && x >= -4) {
					popUpWindow.style.cursor = "ew-resize";
					console.log("left");
				}
				// right resize
				else if (x >= popUpWindow.offsetWidth - 10 && x <= popUpWindow.offsetWidth + 4) {
					popUpWindow.style.cursor = "ew-resize";
					console.log("right");
				}
				// top resize
				else if (y <= 0 && y >= -4) {
					popUpWindow.style.cursor = "ns-resize";
					console.log("top");
				}
				// bottom resize
				else if (y >= popUpWindow.offsetHeight - 10 && y <= popUpWindow.offsetHeight + 4) {
					popUpWindow.style.cursor = "ns-resize";
					console.log("bottom");
				}
			});
			console.log(options);
		}

		dragElem(popUpWindow);
	}

	findWindow(id) {
		return document.querySelector(`#${id}`);
	}

	closeAll() {
		document.querySelectorAll("pop-up-window").forEach((screen) => {
			screen.remove();
		});
		tooltip.hide();
	}

	close(id) {
		document.querySelector(`#${id}`).remove();
		tooltip.hide();
	}
}

const windowController = new WindowController();
