declare global {
	interface Window { require: any; }
}

window.require = window.require || {};

import { Component } from "@angular/core";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.css"]
})
export class AppComponent {
	title = "app";

	lastHeight = 0;

	constructor() {
		// window.addEventListener("resize", () => {
		// 	const cardHeight = document.querySelector("app-main").getBoundingClientRect().height;

		// 	if (cardHeight != this.lastHeight) {
		// 		ipcRenderer.send("resize", window.innerWidth, cardHeight);
		// 		this.lastHeight = cardHeight;
		// 	}
		// });
	}
}
