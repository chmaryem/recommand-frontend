import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { CommonModule } from '@angular/common';



 @Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, HeaderComponent]
})


export class HomeComponent  implements AfterViewInit {
    ngAfterViewInit(): void {
    const videoElement = document.getElementById('heroVideo') as HTMLVideoElement;

    videoElement.addEventListener('loadedmetadata', () => {
      const duration = videoElement.duration;
      const randomTime = Math.random() * duration;
      videoElement.currentTime = randomTime;
    });
  }
    @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef;

  selectedCard: any = null;

  userTypes = [
    { title: 'Designers', image: 'assets/m1.jpg' },
    { title: 'Marketers', image: 'assets/m2.jpg' },
    { title: 'VFX filmmakers', image: 'assets/m2.jpg' },
    { title: 'Content creators', image: 'assets/m2.jpg' }
  ];

  enlargeCard(item: any): void {
    this.selectedCard = item;
  }

  scrollCarousel(direction: number): void {
    const el = this.carouselContainer.nativeElement;
    const scrollAmount = 300;
    el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }




}
