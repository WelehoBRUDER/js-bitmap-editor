const bitmap = document.querySelector(".bitmap");
const bitmapCtx = bitmap.getContext("2d");
const settingsBtn = document.querySelector("#settings");
const printBtn = document.querySelector("#print");
tooltip.create(settingsBtn, "Settings menu");
tooltip.create(printBtn, "Print image to console");

class BitmapEditor {
	constructor() {
		this.map = [];
		this.pixelScale = 24; // default scale: 1 square = 12px
		this.zoomScale = 1;
		this.autoZoom();
		this.prevHover = { x: -1, y: -1 };
		this.drawing = { down: false, color: -1 };

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

	generateMap() {
		const size = this.getSize();
		bitmap.width = settings.width * size;
		bitmap.height = settings.height * size;
		this.map = new Array(settings.height).fill(0).map((x) => new Array(settings.width).fill(0));
		for (let y = 0; y < this.map.length; y++) {
			for (let x = 0; x < this.map[y].length; x++) {
				const col = this.map[y][x];
				this.drawPixel(x, y, col);
			}
		}
	}

	// This function was built mainly by ChatGPT
	// It takes a 2 dimensional array of integers (1s and 0s)
	// and converts it to a 1 dimensional array of hexadecimals representing the bits on the image.
	// Example output: [0xe0,0xf0,0x5b,0x0a,0xa6,0x84,0x86,0xaa,0x1b,0xf0]
	// The output is printed to the console
	createMonovlsbHex() {
		const hexMap = [];
		const map = transposeMatrix(this.map); // transpose the map (swap rows and columns) because the OLED expects width first
		for (let column of map) {
			// loop through each column (row before transposing)
			let byte = 0;
			let bitPos = 0; // iterator for keeping track of the current bit to ensure precision
			for (let x = 0; x < column.length; x++) {
				// x is the current element in the array, either 1 or 0.
				if (column[x]) {
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
		console.log(`[${hexMap.toString()}]`);
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
