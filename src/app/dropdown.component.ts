import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, Renderer2, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  standalone: true,
  animations: [
    trigger('slideMotion', [
      state('hide', style({ height: '0', overflow: 'hidden' })),
      state('show', style({ height: '*', overflow: 'hidden' })),
      transition('hide <=> show', animate('150ms ease-in-out')),
    ]),
  ],
  imports: [CommonModule]
})
export class DropdownComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() isOpen = false;  // Controls dropdown visibility
  @Input() origin!: HTMLElement;  // The trigger element for positioning
  @Output() closed = new EventEmitter<void>();  // Emit event on close
  @Output() selected = new EventEmitter<string>();  // Emit selected item
  @ViewChild('dropdown', { static: false }) dropdownElement!: TemplateRef<any>;

  dropdownPosition: { top?: string; left?: string; width?: string } = {};
  dropdownContainer!: HTMLElement;
  positionInterval!: any;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    if (this.isOpen) {
      this.appendDropdown();
      this.startPositionUpdater();
      this.observeOrigin(); // Start observing the origin
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.appendDropdown();
        this.setPosition();
        this.startPositionUpdater();
        this.observeOrigin(); // Start observing the origin when opened
      } else {
        this.removeDropdown();
        this.disconnectObserver(); // Stop observing when closed
      }
    }
  }

  ngOnDestroy() {
    this.removeDropdown();
    this.stopPositionUpdater();
    this.disconnectObserver(); // Stop observing when closed
  }

  selectOption(option: string) {
    this.selected.emit(option);  // Notify parent that an option is selected
  }

  setPosition() {
    const originRect = this.origin.getBoundingClientRect();
    const dropdownHeight = 300 || 0;
    const availableSpaceBelow = window.innerHeight - originRect.bottom;
    // Adjust position based on available space
    if (availableSpaceBelow < dropdownHeight) {
      this.dropdownPosition = {
        top: `${(originRect.top + window.scrollY) - dropdownHeight}px`,  // Position above the origin
        left: `${originRect.left + window.scrollX}px`,
        width: `${originRect.width}px`
      };
    } else {
      this.dropdownPosition = {
        top: `${originRect.bottom + window.scrollY}px`,  // Position below the origin
        left: `${originRect.left + window.scrollX}px`,
        width: `${originRect.width}px`
      };
    }

    if (this.dropdownContainer) {
      this.renderer.setStyle(this.dropdownContainer, 'top', this.dropdownPosition.top);
      this.renderer.setStyle(this.dropdownContainer, 'left', this.dropdownPosition.left);
      this.renderer.setStyle(this.dropdownContainer, 'width', this.dropdownPosition.width);
    }
  }

  private appendDropdown() {
    if (!this.dropdownContainer) {
      this.dropdownContainer = this.renderer.createElement('div');
      this.renderer.setAttribute(this.dropdownContainer, 'class', 'dropdown');
      this.renderer.setStyle(this.dropdownContainer, 'top', this.dropdownPosition.top);
      this.renderer.setStyle(this.dropdownContainer, 'left', this.dropdownPosition.left);
      this.renderer.setStyle(this.dropdownContainer, 'width', this.dropdownPosition.width);

      // Clone and append the content from dropdownTemplate
      const dropdownContent = this.renderer.createElement('div');
      this.renderer.appendChild(dropdownContent, this.dropdownElement.createEmbeddedView(null).rootNodes[0]);
      this.renderer.appendChild(this.dropdownContainer, dropdownContent);

      this.renderer.appendChild(document.body, this.dropdownContainer);
       // Set initial height for animation
      const dropdownHeight = 300;
      this.renderer.setStyle(this.dropdownContainer, 'height', '0'); // Start with height 0
      this.renderer.setStyle(this.dropdownContainer, 'overflow', 'hidden'); // Start with height 0

    // Use requestAnimationFrame to ensure the height change is applied after the display change
    requestAnimationFrame(() => {
      this.renderer.setStyle(this.dropdownContainer, 'transition', 'height 150ms ease-in-out'); // Add transition
      this.renderer.setStyle(this.dropdownContainer, 'height', `${dropdownHeight}px`); // Animate to full height
    });
    }
  }

  // private removeDropdown() {
  //   if (this.dropdownContainer) {
  //     this.renderer.removeChild(document.body, this.dropdownContainer);
  //     this.dropdownContainer = null!;
  //     this.closed.emit();  // Notify parent that dropdown has closed
  //   }
  // }

  private removeDropdown() {
    if (this.dropdownContainer) {
      const dropdownHeight = 300; // Get the current height for animation

      // Set the transition for height
      this.renderer.setStyle(this.dropdownContainer, 'transition', 'height 150ms ease-in-out');
      this.renderer.setStyle(this.dropdownContainer, 'height', `${dropdownHeight}px`); // Set current height to start animation

      // Use a timeout to allow the height transition to complete before setting to 0
      setTimeout(() => {
        this.renderer.setStyle(this.dropdownContainer, 'height', '0'); // Animate to height 0

        // After the animation duration, remove the dropdown
        setTimeout(() => {
          this.renderer.removeChild(document.body, this.dropdownContainer);
          this.dropdownContainer = null!;
          this.closed.emit(); // Notify parent that dropdown has closed
        }, 150); // Match this timeout with the height transition duration
      }, 0); // Use a slight delay to ensure the transition is applied
    }
  }

  private startPositionUpdater() {
    this.stopPositionUpdater(); // Clear any existing interval
    this.positionInterval = setInterval(() => {
      if (this.isOpen) {
        this.setPosition();
      }
    }, 100); // Adjust the interval time as necessary
  }

  private stopPositionUpdater() {
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
      this.positionInterval = null!;
    }
  }


  private intersectionObserver!: IntersectionObserver;

  // Observe the origin element for visibility
  private observeOrigin() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          this.stopPositionUpdater()
          this.renderer.setStyle(this.dropdownContainer, 'top', 0);
          this.renderer.setStyle(this.dropdownContainer, 'left', 0);
          this.renderer.setStyle(this.dropdownContainer, 'width', 0);
        } else {
          this.setPosition();
          this.startPositionUpdater();
        }
      });
    });

    this.intersectionObserver.observe(this.origin); // Start observing the origin element
  }

  // Disconnect the observer
  private disconnectObserver() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}
