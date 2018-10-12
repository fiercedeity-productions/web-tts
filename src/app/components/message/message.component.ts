import { Component, OnInit } from "@angular/core";
import { MessageService } from "../../services/message.service";
import { trigger, transition, style, animate } from "@angular/animations";

@Component({
	selector: "app-message",
	templateUrl: "./message.component.html",
	styleUrls: ["./message.component.css"],
	animations: [
		trigger("fadeIn", [
			transition(":enter", [
				style({
					opacity: 0
				}),
				animate("250ms ease-out", style({
					opacity: 1
				}))
			]),
			transition(":leave", [
				style({
					opacity: 1
				}),
				animate("250ms ease-out", style({
					opacity: 0
				}))
			])
		])]
})
export class MessageComponent implements OnInit {

	constructor(public msg: MessageService) { }

	ngOnInit() {
	}

}
