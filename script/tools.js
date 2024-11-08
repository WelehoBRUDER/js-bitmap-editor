const pencilBtn = document.querySelector("#pencil");
const fillBtn = document.querySelector("#fill");
tooltip.create(pencilBtn, "Pencil tool");
tooltip.create(fillBtn, "Paint bucket tool");

class ToolController {
	constructor() {
		this.history = [];
		this.tools = {
			pencil: true,
			fill: false,
		};
		this.toolButtons = {
			pencil: pencilBtn,
			fill: fillBtn,
		};
	}

	enable(tool) {
		this.removeAllSelections();
		this.tools[tool] = true;
		this.toolButtons[tool].classList.add("selected");
		bitmapEditor.info();
	}

	removeAllSelections() {
		Object.keys(this.tools).forEach((tool) => {
			this.tools[tool] = false;
			this.toolButtons[tool].classList.remove("selected");
		});
	}

	fill(x, y) {
		const color = bitmapEditor.map[y][x] ? 0 : 1; // opposite of start pixel color
		this.addToHistory({ type: "fill", hist: [] });
		this.fillArea(x, y, color);
	}

	fillArea(x, y, color) {
		const points = [];
		const checkPoints = [
			[-1, 0], // top
			[0, 1], // right
			[1, 0], // bottom
			[0, -1], // left
		];
		points.push([y, x]);
		while (points.length > 0) {
			const [y1, x1] = points.pop();
			// Paint current pixel
			bitmapEditor.paint(x1, y1, true, color);
			// Add this pixel to history for ctrl-z
			this.history[this.history.length - 1].hist.push({ cords: [x1, y1], color: color });
			// Go through each direction and find the neighbors of the current pixel
			checkPoints.forEach(([_y, _x]) => {
				// Check if neighboring pixel exists (is number) and if it is of the opposite color
				if (typeof bitmapEditor.map[y1 + _y]?.[x1 + _x] === "number" && bitmapEditor.map[y1 + _y]?.[x1 + _x] !== color) {
					// If so, store this neighbor as a pixel that needs to be checked
					points.push([y1 + _y, x1 + _x]);
				}
			});
		}
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

fillBtn.addEventListener("click", () => toolController.enable("fill"));
pencilBtn.addEventListener("click", () => toolController.enable("pencil"));
