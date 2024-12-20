const savesBtn = document.querySelector("#saved-images");
tooltip.create(savesBtn, "Local saved images");

class Settings {
	constructor() {
		this.width = 16;
		this.height = 12;
		this.new = false;
		this.saves = [];
		this.unsaved = {};

		this.getSaves();
	}

	getSaves() {
		const saves = localStorage.getItem("MonoVLSB-Bitmap-Editor-Saved-Images");
		if (saves) {
			this.saves = JSON.parse(saves);
		}
	}

	// Resets and opens the settings menu
	open() {
		const settingsElem = document.createElement("div");
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
				id: "name",
				name: "Image name",
				type: "text",
				tt: "Name the current image\nRecommended to use _ instead of spaces",
				getValueFromEditor: true,
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

			if (opt.getValueFromEditor) {
				input.value = bitmapEditor[opt.id];
			} else {
				input.value = opt.default ?? this[opt.id];
			}

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
		windowController.create(settingsElem, { uniqueID: "settings-window" });
	}

	// Applies unsaved changes to the current settings object
	// and then updates the bitmap
	apply() {
		Object.entries(this.unsaved).forEach(([key, value]) => {
			this[key] = value;
		});
		windowController.close("settings-window");
		bitmapEditor.update();
		this.new = false;
	}

	getSaveIndex(name) {
		return this.saves.findIndex((img) => img.name === name);
	}

	saveImage() {
		const name = bitmapEditor.name;
		const saveIndex = this.getSaveIndex(name);
		if (saveIndex >= 0) {
			this.saves[saveIndex] = { name: name, map: bitmapEditor.map };
		} else {
			this.saves.push({ name: name, map: bitmapEditor.map });
		}
		localStorage.setItem("MonoVLSB-Bitmap-Editor-Saved-Images", JSON.stringify(this.saves));
	}

	openSavesMenu() {
		const savesElement = document.createElement("div");
		savesElement.innerHTML = "<h1>Saved images</h1>";
		savesElement.classList.add("saved-images");
		const wrapper = document.createElement("div");
		wrapper.classList.add("save-wrapper");
		this.saves.forEach((save) => {
			const saveContainer = document.createElement("div");
			saveContainer.classList.add("save-container");
			saveContainer.textContent = `${save.name}.h | size: ${save.map[0].length}x${save.map.length}px`;
			const deleteButton = document.createElement("button");
			deleteButton.textContent = "X";
			deleteButton.addEventListener("click", () => {
				console.log("willDelete");
			});
			saveContainer.addEventListener("click", () => {
				if (confirm(`Load image ${save.name}?`)) {
					this.loadImage(save);
				}
			});
			saveContainer.append(deleteButton);
			wrapper.append(saveContainer);
		});
		savesElement.append(wrapper);
		windowController.create(savesElement, { uniqueID: "save-window" });
	}

	loadImage(save) {
		this.width = save.map[0].length;
		this.height = save.map.length;
		bitmapEditor.rename(save.name);
		bitmapEditor.map = save.map;
		bitmapEditor.generateMap(false);
		windowController.close("save-window");
	}
}

const settings = new Settings();

savesBtn.addEventListener("click", () => settings.openSavesMenu());
