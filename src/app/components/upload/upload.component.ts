import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { ImageData } from '../../models/image-data.model';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  @Output() imagesUploaded = new EventEmitter<ImageData[]>();
  @Output() imageSelected = new EventEmitter<number>();

  images: ImageData[] = [];

  constructor(private router: Router, private imageService: ImageService) {
    this.loadImagesFromDB();
  }

  onFileSelected(event: any) {
    const files: File[] = Array.from(event.target.files);
    this.addFiles(files);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files: File[] = Array.from(event.dataTransfer?.files || []);
    this.addFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  addFiles(files: File[]) {
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ImageData = { file, src: e.target?.result };
        this.imageService.addImage(newImage).subscribe(() => {
          this.loadImagesFromDB();
        });
      };
      reader.readAsDataURL(file);
    }
  }

  selectImage(index: number) {
    this.router.navigate(['/viewer'], { state: { images: this.images, selectedIndex: index } });
  }

  goToViewer() {
    this.router.navigate(['/viewer'], { state: { images: this.images, selectedIndex: 0 } });
  }

  clearAll() {
    this.imageService.clearImages().subscribe(() => {
      this.images = [];
      this.imagesUploaded.emit(this.images);
    });
  }

  removeImage(index: number, event: Event) {
    event.stopPropagation();
    const imageId = this.images[index].id;
    if (imageId !== undefined) {
      this.imageService.deleteImage(imageId).subscribe(() => {
        this.loadImagesFromDB();
      });
    }
  }

  loadImagesFromDB() {
    this.imageService.getImages().subscribe((images: ImageData[]) => {
      this.images = images;
      this.imagesUploaded.emit(this.images);
    });
  }
}
