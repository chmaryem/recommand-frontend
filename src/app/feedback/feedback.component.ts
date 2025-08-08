import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebareComponent } from "../sidebare/sidebare.component";
import { FeedbackService } from '../services/feedback.service';
import { Router } from '@angular/router';

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

  liked: boolean | null = null;
  rating: number = 0;
  comment: string = '';
  selectedTags: string[] = [];
  showDetailedFeedback: boolean = false;
  showConfirmation: boolean = false;
  image: string = '';
  errorMessage: string = '';
  submittedRating: number | null = null;

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

  constructor(private feedbackService: FeedbackService, private router: Router) {}

  ngOnInit() {
    const navigation = history.state;
    if (navigation && navigation.outfitItems) {
      this.outfitItems = navigation.outfitItems;
      this.outfitId = navigation.outfitId;
      this.style = navigation.style || 'sunny';
      this.image = navigation.image || '';
    }
  }

  setLike(liked: boolean) {
    this.liked = liked;
    this.showDetailedFeedback = true;
    this.errorMessage = '';
  }

  setRating(rating: number) {
    this.rating = rating;
  }

  toggleTag(tagId: string) {
    const index = this.selectedTags.indexOf(tagId);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tagId);
    }
  }

  isTagSelected(tagId: string): boolean {
    return this.selectedTags.includes(tagId);
  }

  validateFeedback(): boolean {
    if (this.liked === null) {
      this.errorMessage = 'Veuillez indiquer si vous aimez ou non la tenue';
      return false;
    }
    if (this.rating === 0) {
      this.errorMessage = 'Veuillez attribuer une note à la tenue';
      return false;
    }
    return true;
  }

  submitFeedback() {
    if (!this.validateFeedback()) return;

    const feedbackPayload: OutfitFeedback = {
      outfitId: this.outfitId,
      liked: this.liked!,
      rating: this.rating,
      comment: this.comment.trim(),
      tags: this.selectedTags,
      timestamp: new Date()
    };

    this.feedbackService.submitFeedback(feedbackPayload).subscribe({
      next: () => {
        this.submittedRating = this.rating;
        this.showConfirmation = true;
        this.feedbackSubmitted.emit(feedbackPayload);
      },
      error: () => {
        this.errorMessage = 'Une erreur est survenue lors de l\'envoi du feedback';
      }
    });
  }

  closeConfirmation() {
    this.resetFeedback();
    this.router.navigate(['/dashboard'], {
      state: { feedbackSentFor: this.outfitId }
    });
  }

  resetFeedback() {
    this.liked = null;
    this.rating = 0;
    this.comment = '';
    this.selectedTags = [];
    this.showDetailedFeedback = false;
    this.showConfirmation = false;
    this.errorMessage = '';
    this.submittedRating = null;
  }

  skipFeedback() {
    this.resetFeedback();
  }

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
