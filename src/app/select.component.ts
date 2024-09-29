import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css'],
  standalone: true,
  imports: [CommonModule, DropdownComponent ]
})
export class SelectComponent {
  @ViewChild('trigger', { static: false }) triggerElement!: ElementRef;

  options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4', 'Option 4'];
  selectedOption: string | null = null;
  isDropdownOpen = false;
  triggerNativeElement!: HTMLElement;

  ngAfterViewInit() {
    // Safely access the native element after view initialization
    this.triggerNativeElement = this.triggerElement.nativeElement;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onSelect(option: string) {
    this.selectedOption = option;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }



// @HostListener('document:click', ['$event.target'])
// onClickOutside(target: HTMLElement) {
//   if (this.dropdownElement?.nativeElement.contains(target) || this.origin?.contains(target)) {
//     return;
//   }
//   this.closeDropdown();
// }
}
