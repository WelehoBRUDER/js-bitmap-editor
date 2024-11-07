const bitmap = document.querySelector(".bitmap");
const bitmapCtx = bitmap.getContext("2d");
const settingsBtn = document.querySelector("#settings");
const printBtn = document.querySelector("#print");
tooltip.create(settingsBtn, "Settings menu");
tooltip.create(printBtn, "Embed to python\n----------------------\nThis will create a python code\nthat can be embedded to a program.");

class BitmapEditor {
	constructor() {
		this.map = [];
		this.pixelScale = 24; // default scale: 1 square = 12px
		this.zoomScale = 1;
		this.autoZoom();
		this.prevHover = { x: -1, y: -1 };
		this.drawing = { down: false, color: -1 };
		this.output = null;
		this.name = null;
		if (this.name === null) {
			this.rename("new_image");
		}

		this.generateMap();
	}

	getSize() {
		return this.pixelScale * this.zoomScale;
	}

	getMouseCords(event) {
		const size = this.getSize();
		const lX = Math.floor(event.offsetX / size);
		const lY = Math.floor(event.offsetY / size);
		return { x: lX, y: lY };
	}

	hover(event) {
		const { x, y } = this.getMouseCords(event);
		if (this.drawing.down && this.withinBounds(x, y)) this.paint(x, y, event);
		if (this.prevHover.x === x && this.prevHover.y === y) return;
		this.removeHover();
		if (this.withinBounds(x, y)) {
			this.prevHover.x = x;
			this.prevHover.y = y;
			this.drawHover(x, y);
		} else this.release();
	}

	withinBounds(x, y) {
		return !(x < 0 || y < 0 || x > settings.width - 1 || y > settings.height - 1);
	}

	hold(event) {
		const { x, y } = this.getMouseCords(event);
		this.drawing.color = this.map[y][x] ? 0 : 1;
		this.drawing.down = true;
		this.paint(x, y, event);
	}

	release() {
		this.drawing.down = false;
	}

	removeHover() {
		const { x, y } = { ...this.prevHover };
		if (x >= 0 && y >= 0 && x < settings.width && y < settings.height) {
			this.drawPixel(x, y, this.map[y][x]);
		}
	}

	drawHover(x, y) {
		this.drawPixel(x, y, this.map[y][x] ? 0.75 : 0.15);
	}

	drawPixel(x, y, col) {
		const size = this.getSize();
		const color = 255 * (1 - col);
		bitmapCtx.fillStyle = `rgb(${color}, ${color}, ${color})`;
		bitmapCtx.fillRect(x * size, y * size, size, size);
	}

	paint(x, y, event) {
		if (this.map[y][x] === this.drawing.color) return;
		this.map[y][x] = this.drawing.color;
		this.drawPixel(x, y, this.map[y][x]);
	}

	autoZoom() {
		const currentWidth = settings.width * this.pixelScale;
		const clientWidth = window.innerWidth - 64;
		if (currentWidth > clientWidth) {
			this.zoomScale = clientWidth / currentWidth;
		}
	}

	generateMap(createMap = true) {
		const size = this.getSize();
		bitmap.width = settings.width * size;
		bitmap.height = settings.height * size;
		this.prevHover = { x: -1, y: -1 };
		this.drawing = { down: false, color: -1 };
		if (createMap) {
			this.map = new Array(settings.height).fill(1).map((x) => new Array(settings.width).fill(1));
		}
		for (let y = 0; y < this.map.length; y++) {
			for (let x = 0; x < this.map[y].length; x++) {
				const col = this.map[y][x];
				this.drawPixel(x, y, col);
			}
		}
	}

	rename(name) {
		this.name = name;
		document.title = this.name + ".h";
	}

	// This function updates the current map to match new width and height
	// If "new" is selected when applying settings, the map is completely wiped.
	// Otherwise, the map gets padded on x and y coords to match.
	// This padding can't center the original image.
	update() {
		this.autoZoom();
		// Check if the map's size has changed
		if (this.map.length !== settings.height || this.map[0].length !== settings.width) {
			if (settings.new) {
				this.generateMap(); // just create new empty map
			} else {
				// Keeping old image, more precise maneuvers needed

				// Find out how much the size has changed
				const differenceX = settings.width - this.map[0].length;
				const differenceY = settings.height - this.map.length;
				// Y-axis is higher than before
				if (differenceY > 0) {
					for (let i = 0; i < differenceY; i++) {
						this.map.push(new Array(settings.width).fill(1));
					}
					// Y-axis is lower than before
				} else if (differenceY < 0) {
					const startLen = this.map.length + differenceY;
					for (let i = this.map.length - 1; i >= startLen; i--) {
						this.map.splice(i, 1);
					}
				}
				// X-axis is higher than before
				if (differenceX > 0) {
					for (let y = 0; y < this.map.length; y++) {
						if (this.map[y].length !== settings.width) {
							for (let x = 0; x < differenceX; x++) {
								this.map[y].push(1);
							}
						}
					}
					// X-axis is lower than before
				} else if (differenceX < 0) {
					const startLen = this.map[0].length + differenceX;
					for (let y = 0; y < this.map.length; y++) {
						if (this.map[y].length !== settings.width) {
							for (let i = this.map[y].length - 1; i >= startLen; i--) {
								this.map[y].splice(i, 1);
							}
						}
					}
				}
				this.generateMap(false);
			}
		}
		this.rename(settings.unsaved.name);
	}

	// This function was built mainly by ChatGPT
	// It takes a 2 dimensional array of integers (1s and 0s)
	// and converts it to a 1 dimensional array of hexadecimals representing the bits on the image.
	// Example output: [0xe0,0xf0,0x5b,0x0a,0xa6,0x84,0x86,0xaa,0x1b,0xf0]
	// The output is displayed in a window in the middle of screen
	createMonovlsbHex() {
		const hexMap = [];
		const map = transposeMatrix(this.map); // transpose the map (swap rows and columns) because the OLED expects width first
		for (let column of map) {
			// loop through each column (row before transposing)
			let byte = 0;
			let bitPos = 0; // iterator for keeping track of the current bit to ensure precision
			for (let x = 0; x < column.length; x++) {
				// column[x] is the current element in the array, either 1 or 0.
				// this is reversed because the colors on the canvas don't match the intended output
				if (!column[x]) {
					byte |= 1 << bitPos; // do some bitwise magic to eventually get a binary representation of the current column
				}

				bitPos++; // iterate current bit position

				if (x % 8 === 7 || x === column.length - 1) {
					// Check if a byte is completed (8bits)
					hexMap.push(`0x${byte.toString(16).padStart(2, "0")}`); // Create hexadecimal byte and add it to the output
					// Reset for next column
					byte = 0;
					bitPos = 0;
				}
			}

			if (bitPos > 0) {
				// check if there are leftover bits that need to be padded
				hexMap.push(`0x${byte.toString(16).padStart(2, "0")}`);
			}
		}
		this.output = `
		${this.name}_bitmap = bytearray([${hexMap.toString()}])
		${this.name} = framebuf.FrameBuffer(${this.name}_bitmap, ${settings.width}, ${settings.height}, framebuf.MONO_VLSB)
		`;
		const preElem = document.createElement("pre");
		preElem.innerHTML = `
		<p>
			<span>${
				this.name
			}_bitmap = </span><span style="color:slateblue">bytearray</span><span>([</span><span style="color:dodgerblue">${hexMap.toString()}</span><span>])</span><br>
			<span>${this.name} = framebuf.</span><span style="color:orange">FrameBuffer</span><span>(${this.name}_bitmap, ${settings.width}, ${
			settings.height
		}, framebuf.</span><span style="color:orange">MONO_VLSB</span><span>)</span> </p>
		`;
		const copyButton = document.createElement("button");
		const copyIcon = document.createElement("img");
		copyButton.classList.add("tool-btn");
		copyIcon.src = "./img/copy.png";
		copyButton.append(copyIcon);
		copyButton.addEventListener("click", () => {
			this.copy();
			tooltipText.textContent = "Copied to clipboard!";
		});
		tooltip.create(copyButton, "Copy to clipboard");
		preElem.append(copyButton);
		this.createWindow(preElem);
	}

	copy() {
		navigator.clipboard.writeText(this.output);
	}

	createWindow(content, canIgnore = true) {
		if (!content) return console.error("This window doesn't have any content! (Missing content HTMLElement from parameters)");
		const popUpWindow = document.createElement("div");
		const closeButton = document.createElement("div");
		const drag = document.createElement("div");
		popUpWindow.classList.add("pop-up-window");
		closeButton.classList.add("close-button", canIgnore ? "." : "unavailable");
		drag.classList.add("drag");
		closeButton.textContent = "x";
		closeButton.addEventListener("click", () => {
			popUpWindow.remove();
		});
		content.classList.add("content");
		popUpWindow.append(drag, closeButton, content);
		document.body.append(popUpWindow);

		dragElem(popUpWindow);
	}
}

// straight from the gpt
// transposes a given matrix (2D array)
// meaning that rows and columns get swapped
function transposeMatrix(matrix) {
	return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

const bitmapEditor = new BitmapEditor();

bitmap.addEventListener("mousemove", (e) => bitmapEditor.hover(e));
bitmap.addEventListener("mousedown", (e) => bitmapEditor.hold(e));
bitmap.addEventListener("mouseup", (e) => bitmapEditor.release(e));

settingsBtn.addEventListener("click", () => settings.open());
printBtn.addEventListener("click", () => bitmapEditor.createMonovlsbHex());
