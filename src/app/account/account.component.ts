import { Component } from '@angular/core';
import { UploadService } from '../services/upload.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WebcamModule, WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';


@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, WebcamModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {
  selectedFile: File | null = null;
  imageUrl: string | null = null;

  showWebcam = false;
  capturedImage: WebcamImage | null = null;
  private trigger: Subject<void> = new Subject<void>();
  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  constructor(private uploadService: UploadService) {}


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.capturedImage = null;
  }


  captureWebcamImage(): void {
    this.trigger.next();
  }

  handleCapturedImage(webcamImage: WebcamImage): void {
    this.capturedImage = webcamImage;
    this.selectedFile = null;
  }

  toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
    this.selectedFile = null;
    this.capturedImage = null;
  }



  uploadImage() {
    if (this.selectedFile) {
      this.uploadService.uploadUserImage(this.selectedFile).subscribe({
        next: (fileName) => this.imageUrl = `http://localhost:8075/user/image/${fileName}`,
        error: () => alert('Erreur d’upload.')
      });
    } else if (this.capturedImage) {
      this.uploadService.uploadBase64Image(this.capturedImage.imageAsDataUrl).subscribe({
        next: (fileName) => this.imageUrl = `http://localhost:8075/user/image/${fileName}`,
        error: () => alert('Erreur d’upload webcam.')
      });
    } else {
      alert('Aucune image sélectionnée ou capturée.');
    }
  }
}
