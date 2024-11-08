class ToolController {
	constructor() {
		this.history = [];
		this.tools = {
			fill: false,
		};
	}

	enable(tool) {
		this.tools[tool] = true;
		bitmapEditor.info();
	}

	disable(tool) {
		this.tools[tool] = false;
		bitmapEditor.info();
	}

	toggle(tool) {
		if (this.tools[tool]) {
			this.disable(tool);
		} else {
			this.enable(tool);
		}
	}

	fill(x, y) {
		const color = bitmapEditor.map[y][x] ? 0 : 1; // opposite of start pixel color
		this.addToHistory({ type: "fill", hist: [] });
		this.recursiveFill(x, y, color);
	}

	// Recursively fills all mono color space with its opposite color, stopping at hard edges.
	// In simple terms, it's just the fill tool.
	recursiveFill(x, y, color) {
		// Array that stores all neighbors of the current pixel
		const points = [];
		const checkPoints = [
			[-1, 0], // top
			[0, 1], // right
			[1, 0], // bottom
			[0, -1], // left
		];
		// Paint current pixel
		bitmapEditor.paint(x, y, true, color);
		this.history[this.history.length - 1].hist.push({ cords: [x, y], color: color });
		// Go through each direction and find the neighbors of the current pixel
		checkPoints.forEach(([_y, _x]) => {
			// Check if neighboring pixel exists (is number) and if it is of the opposite color
			if (typeof bitmapEditor.map[y + _y]?.[x + _x] === "number" && bitmapEditor.map[y + _y]?.[x + _x] !== color) {
				// If so, store this neighbor as a pixel that needs to be checked
				points.push([y + _y, x + _x]);
			}
		});
		// Go through each neighbor that was marked
		points.forEach(([y2, x2]) => {
			// See recursion
			this.recursiveFill(x2, y2, color);
		});
	}

	addToHistory(event) {
		this.history.push(event);
	}

	reverseHistoryEvent() {
		if (this.history.length === 0) return;
		let event = this.history[this.history.length - 1];

		if (event.type === "fill" || event.type === "paint") {
			for (let paint of event.hist) {
				bitmapEditor.paint(paint.cords[0], paint.cords[1], true, paint.color ? 0 : 1);
			}
		}
		this.history.pop();
	}

	controls(keyEvent) {
		// Ctrl-Z detected!!!!!!
		if (keyEvent.key === "z" && keyEvent.ctrlKey) {
			this.reverseHistoryEvent();
		}
	}
}

const toolController = new ToolController();

document.addEventListener("keydown", (e) => toolController.controls(e));
