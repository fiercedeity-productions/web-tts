
import { Component, OnInit, ElementRef } from "@angular/core";
import { VoiceService, Voice } from "../../services/voice.service";
import { FormControl, Validators } from "@angular/forms";
import { ISOLangs, Formats } from "./defs";
import { MessageService } from "../../services/message.service";
import { SoundService } from "../../sound.service";

// const { clipboard } = window.require("electron");

@Component({
	selector: "app-main",
	templateUrl: "./main.component.html",
	styleUrls: ["./main.component.css"]
})
export class MainComponent implements OnInit {
	languageControl = new FormControl();
	typeControl = new FormControl();
	voiceControl = new FormControl();
	versionControl = new FormControl("v1");
	textControl = new FormControl("", [Validators.required, Validators.maxLength(5000)]);
	ssmlEnabled = false;
	formatControl = new FormControl("LINEAR16");
	profileControl = new FormControl("");
	rateControl = new FormControl(1, [Validators.min(0.25), Validators.max(4), Validators.required]);
	pitchControl = new FormControl(0, [Validators.min(-20), Validators.max(20), Validators.required]);
	gainControl = new FormControl(0, [Validators.min(-96), Validators.max(16), Validators.required]);
	sampleRateControl = new FormControl(24000, [Validators.min(12000), Validators.max(192000), Validators.required]);
	codeControl = new FormControl();

	formats = Formats;

	versions = [{
		val: "v1",
		desc: "Version 1"
	}, {

		val: "v1beta1",
		desc: "Version 1 beta 1"
	}];

	profiles = [{
		val: "",
		desc: "None"
	}, {
		val: "wearable-class-device",
		desc: "Smart watches and wearables"
	}, {
		val: "handset-class-device",
		desc: "Smartphones"
	}, {
		val: "headphone-class-device",
		desc: "Headphones"
	}, {
		val: "small-bluetooth-speaker-class-device",
		desc: "Small home speakers"
	}, {
		val: "medium-bluetooth-speaker-class-device",
		desc: "Home speakers"
	}, {
		val: "large-home-entertainment-class-device",
		desc: "Home entertainment systems"
	}, {
		val: "large-automotive-class-device",
		desc: "Car speakers"
	}, {
		val: "telephony-class-application",
		desc: "IVR systems"
	}];

	requesting = false;
	requestTimestamp: number;
	synthesizedAudio: {
		audio: string;
		format: string;
	};
	dirty = true;
	readyToPlay = false;

	voices: Voice[] = [];
	languages: {
		code: string;
		name: string;
	}[] = [];

	constructor(private voice: VoiceService, private msg: MessageService, public sound: SoundService) {
		this.voice.mainComponent = this;

		this.update();

		document.addEventListener("keypress", (event) => {
			console.log(event);

			// tslint:disable-next-line:max-line-length
			// reqDisabled = !this.languageControl.valid || !this.typeControl.valid || !this.voiceControl.valid || !this.ersionControl.valid || !this.textControl.valid || !this.formatControl.valid || !this.profileControl.valid || !this.rateControl.valid || !this.pitchControl.valid || !this.gainControl.valid || !this.sampleRateControl.valid || !dirty) && !requesting;


			// tslint:disable-next-line:max-line-length
			const reqDisabled = (!this.languageControl.valid || !this.typeControl.valid || !this.voiceControl.valid || !this.versionControl.valid || !this.textControl.valid || !this.formatControl.valid || !this.profileControl.valid || !this.rateControl.valid || !this.pitchControl.valid || !this.gainControl.valid || !this.sampleRateControl.valid || !this.dirty) && !this.requesting;

			const playDisabled = this.dirty || !this.readyToPlay;


			if (event.keyCode == 13 && (event.ctrlKey || event.metaKey) || event.keyCode == 10 || (event.metaKey && event.keyCode == 9)) {
				if (!reqDisabled) this.requestSynthesis(true);
				else if (!playDisabled) this.playSynthesis();

				if (!playDisabled) this.writeToClipboard();
			}

			// alert(`${event.ctrlKey} ${event.metaKey} ${event.keyCode}`);
		});
	}

	async ngOnInit() {
		this.voiceControl.registerOnChange(this.voiceChanged.bind(this));
	}

	async update() {
		this.voices = await this.voice.getVoices();
		this.updateLanguages();
		if (!this.languages.includes(this.languageControl.value)) {
			this.languageControl.setValue("en-GB");
			this.languageChanged();
		}

		if (this.versionControl.value == "v1")
			this.profileControl.setValue("");
	}

	writeToClipboard() {
		const el: any = document.querySelector(".base64");


		this.codeControl
			.setValue(`${this.formats.find(v => v.code == this.synthesizedAudio.format).web};base64,${this.synthesizedAudio.audio}`);

		if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
			const contentEditable = el.contentEditable, readOnly = el.readOnly, range = document.createRange();
			el.contentEditable = true;
			el.readOnly = false;

			console.log(el);
			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
			el.setSelectionRange(0, 9999999);
			el.contentEditable = contentEditable;
			el.readOnly = readOnly;
		} else {
			el.select();
		}

		console.log(document.execCommand("copy"));
		el.blur();
	}

	findVoices(languageCode: string, type?: "Standard" | "Wavenet", gender?: "MALE" | "FEMALE" | "NEUTRAL") {
		// let filtered: Voice[] = this.voices.filter(v => v.languageCodes.findIndex(s => s == languageCode) != -1);
		let filtered: Voice[] = this.voices.filter(v => v.languageCodes.includes(languageCode));
		if (!type)
			return filtered;

		filtered = filtered.filter(v => v.name.includes(type));
		if (!gender)
			return filtered;

		filtered = filtered.filter(v => v.ssmlGender == gender);
		return filtered;
	}

	updateLanguages() {
		const languageCodes = new Set<string>();
		const languages: {
			code: string;
			name: string;
		}[] = [];

		for (const voice of this.voices)
			for (const languageCode of voice.languageCodes)
				languageCodes.add(languageCode);

		for (const code of Array.from(languageCodes)) {
			languages.push({
				code: code,
				name: `${code in ISOLangs ? ISOLangs[code] : code}`
			});
		}

		this.languages = languages;
		this.languages.sort((a, b) => Number(a.name > b.name));
	}

	getTypes() {
		const types = new Set<string>();

		for (const voice of this.findVoices(this.languageControl.value))
			types.add(voice.name.includes("Wavenet") ? "Wavenet" : "Standard");

		return Array.from(types).sort((a, b) => Number(a < b));
	}

	getVoices() {
		const voices = new Set<Voice>();

		for (const voice of this.findVoices(this.languageControl.value, this.typeControl.value))
			voices.add(voice);

		return Array.from(voices).sort((a, b) => Number(a.name > b.name));
	}

	async versionChanged() {
		this.voice.setApiVersion(this.versionControl.value);
		await this.update();
	}

	languageChanged() {
		this.dirty = true;

		if (!this.getTypes().includes(this.typeControl.value)) {
			this.typeControl.setValue(this.getTypes()[0]);
		}

		this.typeChanged();
	}

	typeChanged() {
		this.dirty = true;

		this.voiceControl.setValue(this.getVoices()[0].name);
	}

	async profileChanged() {
		this.dirty = true;

		if (this.profileControl.value !== "" && this.versionControl.value == "v1") {
			this.versionControl.setValue("v1beta1");
			this.voice.setApiVersion("v1beta1");
			await this.update();
		}
	}

	voiceChanged() {
		this.dirty = true;
		console.log("hello");
		this.sampleRateControl.setValue(this.voices.find(v => v.name == this.voiceControl.value).naturalSampleRateHertz);
	}

	textChanged() {
		this.dirty = true;
	}

	formatChanged() {
		this.dirty = true;
	}

	rateChanged() {
		this.dirty = true;
	}

	pitchChanged() {
		this.dirty = true;
	}

	gainChanged() {
		this.dirty = true;
	}

	sampleRateChanged() {
		this.dirty = true;
	}

	requestSynthesis(copy = false) {
		this.dirty = false;
		this.readyToPlay = false;

		this.getSynthesis((res, format) => {
			this.readyToPlay = true;

			this.synthesizedAudio = {
				audio: res,
				format: format
			};

			if (!navigator.userAgent.match(/ipad|ipod|iphone/i)) {
				if (this.sound.playing)
					this.playSynthesis();
				this.playSynthesis();
			}

			if (copy) this.writeToClipboard();
		});
	}

	getSynthesis(callback: (res: string, format: string) => void) {
		if (!this.requesting) { // making a new request
			this.requesting = true;
			this.requestTimestamp = +new Date;

			const usedFormat = this.formatControl.value;

			this.voice.getSynthesis(this.ssmlEnabled ? {
				ssml: this.textControl.value
			} : {
					text: this.textControl.value
				}, {
					languageCode: this.languageControl.value,
					name: this.voiceControl.value
				}, {
					audioEncoding: usedFormat,
					effectsProfileId: this.versionControl.value == "v1" ? undefined : this.profileControl.value == "" ? [] : [this.profileControl.value],
					pitch: this.pitchControl.value,
					sampleRateHertz: this.sampleRateControl.value,
					speakingRate: this.rateControl.value,
					volumeGainDb: this.gainControl.value
				}, this.requestTimestamp).then(res => {
					if (res) { // save if not cancelled
						callback(res.audio, res.format);

						if (this.requesting)
							this.requesting = false;
					}
				});
		} else {
			// cancel the request
			this.voice.cancelRequest(this.requestTimestamp);
			this.requesting = false;
			this.dirty = true;
		}
	}

	saveSynthesis(evt: MouseEvent) {
		this.sound.save(this.synthesizedAudio.audio, this.formats.find(v => v.code == this.synthesizedAudio.format));
	}

	playSynthesis() {
		this.sound.play(this.synthesizedAudio.audio, this.formats.find(v => v.code == this.synthesizedAudio.format));
	}

	showVersionHelp() {
		// tslint:disable-next-line:max-line-length
		this.msg.showMessage("This programme bypasses the paywall for the Google Cloud Text-to-Speech API to provide a free, easy and unlimited way to produce and save realistic synthesized speech.\n\nVersions 1 beta 1 and onwards allow the use of device profiles, which are effects added to the synthesized audio to better suit specific use cases.\n\nIf unsure, set the API version to the latest non-development version.", "API Information");
	}

	showVoiceTypeHelp() {
		// tslint:disable-next-line:max-line-length
		this.msg.showMessage("Standard voices are available for all languages. WaveNet voices are trained on DeepMind's machine learning algorithms and generate more natural-sounding synthesis. Not all languages are currently supported by WaveNet.", "Standard and WaveNet Voices");
	}

	showVoiceNameHelp() {
		this.msg.showMessage("Different languages may have multiple voices with different genders and styles of speech.", "Voice Names");
	}

	showProfileHelp() {
		// tslint:disable-next-line:max-line-length
		this.msg.showMessage("For version 1 beta 1 and upwards, effects can be applied to the synthesized audio to better suit different use cases.", "Device Profiles");
	}

	showSampleRateHelp() {
		// tslint:disable-next-line:max-line-length
		this.msg.showMessage("The synthesized audio will be resampled to the specified sample rate, which defaults to each voice's natural sample rate.\n\nIf unsure, leave this unchanged.", "Sample Rate");
	}

	showSSMLHelp() {
		// tslint:disable-next-line:max-line-length
		this.msg.showMessage(`SSML (Speech Synthesis Markup Language) allows you to control the voice at a finer degree, manipulating emphasis, pitch, pronounciation, etc.\n\nValid SSML is required for success. If unsure, use plaintext instead.`, "Speech Synthesis Markup Language");
	}
}
