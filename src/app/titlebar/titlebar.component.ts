import { Component, OnInit } from "@angular/core";
// const { ipcRenderer } = window.require("electron");

@Component({
	selector: "app-titlebar",
	templateUrl: "./titlebar.component.html",
	styleUrls: ["./titlebar.component.css"]
})
export class TitlebarComponent implements OnInit {
	focussed = true;
	maximized = false;
	closeHovered = false;
	closeHoverLock = false;

	minimizeDisabled = false;
	maximizeDisabled = true;
	closeDisabled = false;

	constructor() {
		// ipcRenderer.on("maximized-update", (evt, val) => {
		// 	this.maximized = val;
		// 	console.log(val);
		// });

		// // getting window focussed state

		// ipcRenderer.on("focus", () => this.focussed = true);
		// ipcRenderer.on("blur", () => this.focussed = false);

		// window.setInterval(() => this.focussed = this.focussed, 100);
	}

	ngOnInit() {
	}

	setCloseHoverLock() {
		console.log("hi");
		this.closeHoverLock = true;
		setTimeout(() => this.closeHoverLock = false, 500);
	}

	close() {
		// setTimeout(() => ipcRenderer.send("close"), 125);
	}

	minimize() {
		// ipcRenderer.send("minimize");
	}

	maximize() {
		// ipcRenderer.send("maximize", this);
	}

}
