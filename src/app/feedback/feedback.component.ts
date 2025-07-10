import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebareComponent } from "../sidebare/sidebare.component";

export interface OutfitItem {
  id: string;
  type: 'tshirt' | 'jean' | 'baskets' | 'blouse' | 'short' | 'sandales';
  name: string;
  color: string;
  image?: string;
  description?: string;
}

export interface OutfitFeedback {
  outfitId: string;
  liked: boolean;
  rating: number;
  comment?: string;
  tags: string[];
  timestamp: Date;
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebareComponent],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  @Input() outfitItems: OutfitItem[] = [];
  @Input() outfitId: string = '';
  @Input() style: 'sunny' | 'alternative' = 'sunny';
  @Output() feedbackSubmitted = new EventEmitter<OutfitFeedback>();

  // État du feedback
  liked: boolean | null = null;
  rating: number = 0;
  comment: string = '';
  selectedTags: string[] = [];
  showDetailedFeedback: boolean = false;

  // Tags disponibles
  availableTags = [
    { id: 'comfortable', label: 'Confortable', icon: '😌' },
    { id: 'stylish', label: 'Élégant', icon: '✨' },
    { id: 'weather-appropriate', label: 'Adapté à la météo', icon: '🌤️' },
    { id: 'color-match', label: 'Belles couleurs', icon: '🎨' },
    { id: 'trendy', label: 'Tendance', icon: '🔥' },
    { id: 'classic', label: 'Classique', icon: '👔' },
    { id: 'casual', label: 'Décontracté', icon: '👕' },
    { id: 'formal', label: 'Formel', icon: '🎩' },
    { id: 'not-my-style', label: 'Pas mon style', icon: '🤷' },
    { id: 'too-bold', label: 'Trop osé', icon: '⚡' },
    { id: 'too-simple', label: 'Trop simple', icon: '😐' },
    { id: 'poor-fit', label: 'Mauvaise coupe', icon: '📏' }
  ];

  ngOnInit() {
    // Initialisation du composant
  }

  // Gérer le like/dislike
  setLike(liked: boolean) {
    this.liked = liked;
    if (liked) {
      this.showDetailedFeedback = true;
    } else {
      // Si dislike, on peut directement soumettre ou demander plus de détails
      this.showDetailedFeedback = true;
    }
  }

  // Gérer la notation par étoiles
  setRating(rating: number) {
    this.rating = rating;
  }

  // Gérer la sélection des tags
  toggleTag(tagId: string) {
    const index = this.selectedTags.indexOf(tagId);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tagId);
    }
  }

  // Vérifier si un tag est sélectionné
  isTagSelected(tagId: string): boolean {
    return this.selectedTags.includes(tagId);
  }

  // Soumettre le feedback
  submitFeedback() {
    if (this.liked === null) {
      return; // Pas de feedback si aucun choix
    }

    const feedback: OutfitFeedback = {
      outfitId: this.outfitId,
      liked: this.liked,
      rating: this.rating,
      comment: this.comment.trim(),
      tags: this.selectedTags,
      timestamp: new Date()
    };

    this.feedbackSubmitted.emit(feedback);
    this.resetFeedback();
  }

  // Réinitialiser le feedback
  resetFeedback() {
    this.liked = null;
    this.rating = 0;
    this.comment = '';
    this.selectedTags = [];
    this.showDetailedFeedback = false;
  }

  // Ignorer le feedback
  skipFeedback() {
    this.resetFeedback();
  }

  // Obtenir les tags filtrés selon le type de feedback
  getFilteredTags() {
    if (this.liked === true) {
      return this.availableTags.filter(tag =>
        !['not-my-style', 'too-bold', 'too-simple', 'poor-fit'].includes(tag.id)
      );
    } else if (this.liked === false) {
      return this.availableTags.filter(tag =>
        ['not-my-style', 'too-bold', 'too-simple', 'poor-fit', 'weather-appropriate'].includes(tag.id)
      );
    }
    return this.availableTags;
  }
}
