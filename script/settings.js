const settingsElem = document.querySelector(".settings");

class Settings {
	constructor() {
		this.width = 13;
		this.height = 10;
		this.unsaved = {};
	}

	open() {
		settingsElem.textContent = "";
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
				name: "Image width (px)",
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
			this.unsaved[opt.id] = this.default ?? null;
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

			tooltip.create(setting, opt.tt);
			setting.append(input, label);
			settingsElem.append(setting);
		});
	}
}

const settings = new Settings();
