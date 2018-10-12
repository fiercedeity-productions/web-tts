declare global {
	interface Window { require: any; }
}

window.require = window.require || {};

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MessageService } from "./message.service";
import { MainComponent } from "../components/main/main.component";

// const { ipcRenderer } = window.require("electron");

export class Voice {
	languageCodes: string[];
	name: string;
	naturalSampleRateHertz: number;
	ssmlGender: "MALE" | "FEMALE" | "NEUTRAL";
}

export class SynthesizeInput {
	text?: string;
	ssml?: string;
}

export class VoiceSelectionParams {
	languageCode: string;
	name?: string;
	ssmlGender?: "MALE" | "FEMALE" | "NEUTRAL";
}

export class AudioConfig {
	audioEncoding: "LINEAR16" | "MP3" | "OGG_OPUS";
	speakingRate?: number; // 0.25 - 4.0
	pitch?: number; // -20 - 20
	volumeGainDb?: number; // -96 - 16
	sampleRateHertz?: number;
	effectsProfileId?: ("wearable-class-device" |
		"handset-class-device" |
		"headphone-class-device" |
		"small-bluetooth-speaker-class-device" |
		"medium-bluetooth-speaker-class-device" |
		"large-home-entertainment-class-device" |
		"large-automotive-class-device" |
		"telephony-class-application")[] = [];
}

@Injectable({
	providedIn: "root"
})
export class VoiceService {
	appLoaded = false;
	mainComponent: MainComponent;

	private cancelledTimestamps: number[] = [];

	private ver: "v1" | "v1beta1" = "v1";

	private proxy = "https://cxl-services.appspot.com/proxy?url=";
	private url = "https://texttospeech.googleapis.com/";
	private voices = "voices";
	private synthesize = "text:synthesize";

	constructor(private http: HttpClient, private msg: MessageService) {
	}

	ipcSendInit() {
		// if for first time, send "init" event via ipc to show the winodow
		if (!this.appLoaded) {
			// ipcRenderer.send("init");
			this.appLoaded = true;
		}
	}

	getVoices() {
		return this.http.get(`${this.proxy}${this.url}${this.ver}/${this.voices}`).toPromise().catch(err => {
			this.msg.showMessage(`${!(typeof err.error == "string") && "error" in err.error ? err.error.error.message : err.error}\n
			${err.message}`,
				"Error fetching voices");

			this.ipcSendInit();
		}).then((res: any) => {
			this.ipcSendInit();
			return res.voices;
		});
	}

	getSynthesis(input: SynthesizeInput, voice: VoiceSelectionParams, audio: AudioConfig, timestamp: number) {
		return this.http.post(`${this.proxy}${this.url}${this.ver}/${this.synthesize}`, {
			audioConfig: audio,
			input: input,
			voice: voice
		}).toPromise().catch(err => {
			if (!this.cancelledTimestamps.includes(timestamp)) {
				this.msg.showMessage(!(typeof err.error == "string") && "error" in err.error ? err.error.error.message : err.error,
					"Error synthesizing text");
				this.mainComponent.requesting = false;
				this.mainComponent.dirty = true;
			}
		}).then((res: any) => {
			if (res && "audioContent" in res && !this.cancelledTimestamps.includes(timestamp))
				return {
					audio: res.audioContent,
					format: audio.audioEncoding
				};
		});
	}

	setApiVersion(ver: "v1" | "v1beta1") {
		this.ver = ver;
	}

	cancelRequest(timestamp: number) {
		this.cancelledTimestamps.push(timestamp);
	}
}
