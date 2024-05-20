import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ImageData } from '../../models/image-data.model';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnChanges {
  @Input() showModal: boolean = false;
  @Input() hotspotIndex: number | null = null;
  @Input() images: ImageData[] = [];
  @Input() selectedImageName: string | null = null;
  @Input() currentImageName: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string>();

  filteredImages: ImageData[] = [];

  ngOnInit() {
    this.filterImages();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentImageName'] || changes['images']) {
      this.filterImages();
    }
  }

  filterImages() {
    this.filteredImages = this.images.filter(image => image.file.name !== this.currentImageName);
    if (this.selectedImageName === null && this.filteredImages.length > 0) {
      this.selectedImageName = this.filteredImages[0].file.name || null;
    }
  }

  closeModal() {
    this.showModal = false;
    this.close.emit();
  }

  saveSelection() {
    if (this.selectedImageName !== null) {
      this.selectionChange.emit(this.selectedImageName);
      this.closeModal();
    }
  }
}
