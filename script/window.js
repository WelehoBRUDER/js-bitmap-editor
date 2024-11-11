class WindowController {
	constructor() {
		this.holding = false;
		this.resizing = {
			currently: false,
			dir: "",
			window: null,
			callback: null,
		};
		this.prev = {
			x: 0,
			y: 0,
		};

		document.addEventListener("mouseup", (e) => {
			if (this.resizing.currently) {
				document.body.style.cursor = "default";
				if (this.resizing.callback) {
					this.resizing.callback();
				}
			}
			this.holding = false;
			this.resizing = { currently: false, dir: "", window: null, callback: null };
		});
		document.addEventListener("mousemove", (e) => {
			const { offsetX: x, offsetY: y } = e;
			if (this.resizing.currently) {
				const cursors = {
					e: "ew-resize",
					w: " ew-resize",
				};
				const dir = this.resizing.dir;
				const elem = this.resizing.window;
				document.body.style.cursor = `${cursors[dir]}`;
				if (dir === "e" || dir === "w") {
					const diff = dir === "e" ? x - this.prev.x : this.prev.x - x;
					elem.style.width = `${elem.offsetWidth + diff}px`;
				} else if (dir === "n" || dir === "s") {
					const diff = dir === "n" ? this.prev.y - y : y - this.prev.y;
					elem.style.height = `${elem.offsetHeight + diff}px`;
				}
			}

			this.prev = { x, y };
		});
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
			popUpWindow.addEventListener("mousedown", () => {
				this.holding = true;
			});
			popUpWindow.addEventListener("mousemove", (e) => {
				if (!this.resizing.currently) {
					popUpWindow.style.cursor = "default";
				}
				const { offsetX: x, offsetY: y } = e;
				// north-west
				if (x <= 0 && y >= -4 && y <= 0) {
					popUpWindow.style.cursor = "nwse-resize";
					if (this.holding) this.resizing = { currently: true, dir: "nw", window: popUpWindow, callback: options?.onResize };
				}
				// south-west
				else if (x <= 0 && y >= popUpWindow.offsetHeight - 10 && y <= popUpWindow.offsetHeight + 4) {
					popUpWindow.style.cursor = "nesw-resize";
					this.resizing = { currently: true, dir: "sw", window: popUpWindow, callback: options?.onResize };
				}
				// south-east
				else if (x >= popUpWindow.offsetWidth - 10 && y >= popUpWindow.offsetHeight - 10 && y <= popUpWindow.offsetHeight + 4) {
					popUpWindow.style.cursor = "nwse-resize";
					if (this.holding) this.resizing = { currently: true, dir: "se", window: popUpWindow, callback: options?.onResize };
				}
				// north-east
				else if (x >= popUpWindow.offsetWidth - 10 && y >= -4 && y <= 0) {
					popUpWindow.style.cursor = "nesw-resize";
					if (this.holding) this.resizing = { currently: true, dir: "ne", window: popUpWindow, callback: options?.onResize };
				}
				// west resize
				else if (x <= 0 && x >= -4) {
					popUpWindow.style.cursor = "ew-resize";
					if (this.holding) this.resizing = { currently: true, dir: "w", window: popUpWindow, callback: options?.onResize };
				}
				// east resize
				else if (x >= popUpWindow.offsetWidth - 10 && x <= popUpWindow.offsetWidth + 4) {
					popUpWindow.style.cursor = "ew-resize";
					if (this.holding) this.resizing = { currently: true, dir: "e", window: popUpWindow, callback: options?.onResize };
				}
				// north resize
				else if (y <= 0 && y >= -4) {
					popUpWindow.style.cursor = "ns-resize";
					if (this.holding) this.resizing = { currently: true, dir: "n", window: popUpWindow, callback: options?.onResize };
				}
				// south resize
				else if (y >= popUpWindow.offsetHeight - 10 && y <= popUpWindow.offsetHeight + 4) {
					popUpWindow.style.cursor = "ns-resize";
					this.resizing = { currently: true, dir: "s", window: popUpWindow, callback: options?.onResize };
				}
			});
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
