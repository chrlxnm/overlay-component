import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SelectComponent } from './select.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SelectComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'my-first-project';
	public bff: string | null;
	public friends: string[];
	public menuClass: string;
	constructor() {

		this.bff = null;
		this.friends = [
			"Kim", "Joe", "Kit", "Tom", "Henry", "Hanna", "Dave", "Ellen", "Tina",
			"Bobby", "Todd", "Pam", "Zena The Warrior Princess"
		];
		this.menuClass = "center";

	}

	// ---
	// PUBLIC METHODS.
	// ---

	// I reposition the html-select menu so that we can see how it behaves when it gets
	// close to one of the viewport edges.
	public reposition( newMenuClass: string ) : void {

		this.menuClass = newMenuClass;

	}
}
