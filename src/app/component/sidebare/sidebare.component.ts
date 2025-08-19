import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebare',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebare.component.html',
  styleUrls: ['./sidebare.component.css']
})
export class SidebareComponent {
  @Input() menuItems: MenuItem[] = [
    { icon: '🏠', label: 'Dashboard', route: '/dashboard', active: true },
    { icon: '📊', label: 'Historique', route: '/history', active: false },
    { icon: '👤', label: 'Profil', route: '/performance', active: false },
    { icon: '⚙️', label: 'Feedback', route: '/feedback', active: false },

  ];

  onMenuItemClick(itemIndex: number): void {
    this.menuItems.forEach((item, index) => {
      item.active = index === itemIndex;
    });
  }
}
