const tooltipBox = document.querySelector(".tooltip-box");
const tooltipText = tooltipBox.querySelector(".text");

class Tooltip {
	create(element, text) {
		element.onmouseover = (e) => {
			this.show(e, text);
		};
		element.onmousemove = this.move;
		element.onmouseleave = this.hide;
	}

	show(event, text) {
		tooltipBox.style.display = "block";
		tooltipText.textContent = text;
		this.move(event);
	}

	move(event) {
		tooltipBox.style.left = `${event.x + 15}px`;
		tooltipBox.style.top = `${event.y - 25}px`;
		if (tooltipBox.offsetLeft + tooltipBox.offsetWidth > innerWidth) {
			tooltipBox.style.left = innerWidth - tooltipBox.offsetWidth - (innerWidth - event.x) + "px";
		}
		if (tooltipBox.offsetTop + tooltipBox.offsetHeight > innerHeight) {
			tooltipBox.style.top = innerHeight - tooltipBox.offsetHeight - (innerHeight - event.y) + "px";
		}
	}

	hide() {
		tooltipText.textContent = "";
		tooltipBox.style.display = "none";
	}

	update(element, text) {
		element.onmouseover = (e) => {
			this.show(e, text);
		};
	}
}

const tooltip = new Tooltip();
