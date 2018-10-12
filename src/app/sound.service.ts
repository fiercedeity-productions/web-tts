declare global {
	interface Window { require: any; }
}

window.require = window.require || {};

import { Injectable } from "@angular/core";
import { MessageService } from "./services/message.service";

// const { dialog } = window.require("electron").remote;
// const fs = window.require("fs");

declare const Buffer;

@Injectable({
	providedIn: "root"
})
export class SoundService {
	private audio: HTMLAudioElement = new Audio();

	playing = false;

	constructor(private msg: MessageService) { }

	save(base64, format) {
		// window.location = `${format.web};base64,${base64}`;

		// todo: save

		// dialog.showSaveDialog({
		// 	title: "Save Synthesized Text",
		// 	filters: [{
		// 		name: format.name,
		// 		extensions: [format.extension]
		// 	}]
		// }, (fileName) => {
		// 	if (fileName) {
		// 		const buf = new Buffer(base64, "base64"); // tslint:disable-line

		// 		// todo: save

		// 		// fs.writeFile(fileName, buf, (err) => {
		// 		// 	if (err)
		// 		// 		this.msg.showMessage(err, "Error saving audio file");
		// 		// });
		// 	}
		// });
	}

	play(base64, format) {
		if (!this.audio.paused) {
			this.audio.pause();

			this.playing = false;
		} else {
			delete this.audio;
			this.audio = new Audio(`${format.web};base64,${base64}`);
			this.audio.play();

			this.playing = true;

			this.audio.onended = () => this.playing = false;

			// needed for hack to update the play button in MainComponent
			setInterval(() => this.playing = this.playing, 100);
		}
	}

}
