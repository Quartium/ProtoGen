import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ImageData } from '../../models/image-data.model';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() hotspotIndex: number | null = null;
  @Input() images: ImageData[] = [];
  @Input() selectedImageName: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string>();

  ngOnInit() {
    if (this.selectedImageName === null && this.images.length > 0) {
      this.selectedImageName = this.images[0].file.name || null;
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
