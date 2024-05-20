import { Component } from '@angular/core';

interface ImageData {
  file: File;
  src: string | ArrayBuffer | null;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  uploadedImages: ImageData[] = [];
  selectedIndex: number = 0;

  onImagesUploaded(images: ImageData[]) {
    this.uploadedImages = images;
  }

  onImageSelected(index: number) {
    this.selectedIndex = index;
  }
}
