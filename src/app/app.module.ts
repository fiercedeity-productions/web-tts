import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from "./app.component";
import {
	MatFormFieldModule,
	MatButtonModule,
	MatCardModule,
	MatSelectModule,
	MatInputModule,
	MatCheckboxModule,
	MatSliderModule
} from "@angular/material";

import { RouterModule, Routes } from "@angular/router";
import { MainComponent } from "./components/main/main.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MessageComponent } from "./components/message/message.component";
import { TitlebarComponent } from './titlebar/titlebar.component';

const routes: Routes = [
	{
		path: "",
		component: MainComponent
	}
];

@NgModule({
	declarations: [
		AppComponent,
		MainComponent,
		MessageComponent,
		TitlebarComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		MatFormFieldModule,
		MatButtonModule,
		MatCardModule,
		MatSelectModule,
		FormsModule,
		ReactiveFormsModule,
		MatInputModule,
		MatCheckboxModule,
		MatSliderModule,
		RouterModule.forRoot(routes, {
			useHash: true
		}),
		HttpClientModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
