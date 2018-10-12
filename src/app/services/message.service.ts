import { Injectable } from "@angular/core";

export class Message {
	message: string;
	title?: string | null = null;
	subtitle?: string | null = null;
	addressed = false;

	constructor(message: string | Message, title?: string, subtitle?: string) {
		if (message instanceof Message) {
			this.message = message.message;
			this.title = message.title;
			this.subtitle = message.subtitle;
			return;
		}

		this.message = message;
		if (title) this.title = title;
		if (subtitle) this.subtitle = subtitle;
	}
}

@Injectable({
	providedIn: "root"
})
export class MessageService {
	messages: Message[] = [];

	constructor() {
	}
	showMessage(msg: string | Message, title?: string, subtitle?: string) {
		if (msg instanceof Message)
			this.messages.push(new Message(msg));
		else
			this.messages.push(new Message(msg, title, subtitle));
	}

	messagesShown() {
		return this.messages.findIndex(m => !m.addressed) != -1;
	}

	getMessages() {
		return this.messages.filter(m => !m.addressed);
	}
}
