import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebare',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebare.component.html',
  styleUrls: ['./sidebare.component.css']
})
export class SidebareComponent {

  menuItems = [
    { 
      icon: '🏠', 
      label: 'Accueil', 
      route: '/home',
      active: false 
    },
    { 
      icon: '👤', 
      label: 'Profil', 
      route: '/account',
      active: false 
    },
    { 
      icon: '🎨', 
      label: 'Style', 
      route: '/style-preferences',
      active: true 
    },
    { 
      icon: '👕', 
      label: 'Garde-robe', 
      route: '/wardrobe',
      active: false 
    },
    { 
      icon: '📊', 
      label: 'Statistiques', 
      route: '/dashboard',
      active: false 
    },
    { 
      icon: '⚙️', 
      label: 'Paramètres', 
      route: '/settings',
      active: false 
    }
  ];

  constructor() { }

  setActiveItem(index: number): void {
    this.menuItems.forEach((item, i) => {
      item.active = i === index;
    });
  }
}