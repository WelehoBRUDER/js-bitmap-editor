const settingsElem = document.querySelector(".settings");

class Settings {
	constructor() {
		this.width = 16;
		this.height = 12;
		this.new = false;
		this.isOpen = false;
		this.unsaved = {};
	}

	// Resets and opens the settings menu
	open() {
		if (this.isOpen) return this.close();
		settingsElem.textContent = "";
		settingsElem.style.display = "block";
		this.isOpen = true;
		this.unsaved = {};
		const options = [
			{
				id: "width",
				name: "Image width (px)",
				type: "number",
				tt: "Set width of image in pixels",
			},
			{
				id: "height",
				name: "Image height (px)",
				type: "number",
				tt: "Set height of image in pixels",
			},
			{
				id: "new",
				name: "New image",
				type: "checkbox",
				tt: "When checked, the image is cleared upon applying settings.",
				default: false,
			},
		];
		options.forEach((opt) => {
			this.unsaved[opt.id] = this.default ?? this[opt.id];
			const setting = document.createElement("div");
			setting.classList.add("setting");

			const input = document.createElement("input");
			const label = document.createElement("label");
			input.id = opt.id;
			input.name = opt.id;
			label.htmlFor = opt.id;
			label.textContent = opt.name;

			input.type = opt.type;

			input.value = opt.default ?? this[opt.id];

			input.addEventListener("input", () => {
				if (opt.type === "number") {
					this.unsaved[opt.id] = parseInt(input.value);
				} else {
					this.unsaved[opt.id] = input.value;
				}
			});

			tooltip.create(setting, opt.tt);
			setting.append(input, label);
			settingsElem.append(setting);
		});
		const saveButton = document.createElement("button");
		saveButton.textContent = "Apply";
		saveButton.classList.add("button-basic");
		saveButton.addEventListener("click", () => {
			this.apply();
		});
		tooltip.create(saveButton, "Apply current settings");
		settingsElem.append(saveButton);
		const cancelButton = document.createElement("button");
		cancelButton.textContent = "Close";
		cancelButton.classList.add("button-basic");
		cancelButton.addEventListener("click", () => {
			this.close();
		});
		tooltip.create(cancelButton, "Close settings menu");
		settingsElem.append(cancelButton);
	}

	close() {
		this.isOpen = false;
		settingsElem.textContent = "";
		tooltip.hide();
		settingsElem.style.display = "none";
	}

	// Applies unsaved changes to the current settings object
	// and then updates the bitmap
	apply() {
		Object.entries(this.unsaved).forEach(([key, value]) => {
			this[key] = value;
		});
		this.close();
		bitmapEditor.update();
		this.new = false;
	}
}

const settings = new Settings();
