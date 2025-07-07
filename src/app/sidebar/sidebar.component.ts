import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebare',
  standalone: true,
  imports: [CommonModule],
  template: `<aside class="app-sidebar"><!-- Sidebar placeholder --></aside>`,
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {}