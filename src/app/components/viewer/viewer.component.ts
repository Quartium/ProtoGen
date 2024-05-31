import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { HtmlGenerationService } from '../../services/html-generation.service';
import { ImageData } from '../../models/image-data.model';
import { Hotspot } from '../../models/hotspot.model';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit, AfterViewInit {
  images: ImageData[] = [];
  currentIndex: number = 0;
  currentImageSrc: string | ArrayBuffer | null = '';
  currentImage: ImageData | undefined;

  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  showModal: boolean = false;
  selectedHotspotIndex: number | null = null;
  selectedHotspotImageName: string | null = null;
  currentImageName: string | null = null;

  mode: 'build' | 'play' = 'build';

  constructor(
    private router: Router,
    private imageService: ImageService,
    private htmlGenerationService: HtmlGenerationService,
    private cdr: ChangeDetectorRef
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.images = navigation.extras.state['images'];
      this.currentIndex = navigation.extras.state['selectedIndex'];
    } else {
      this.loadImagesFromDB();
    }
  }

  ngOnInit() {
    if (this.images.length > 0) {
      this.loadImage(this.currentIndex);
    }
  }

  ngAfterViewInit() {
    if (this.images.length > 0) {
      this.drawHotspots();
      this.cdr.detectChanges();
    }
  }

  loadImage(index: number) {
    this.currentIndex = index;
    this.currentImageSrc = this.images[index].src;
    this.currentImage = this.images[index];
    this.currentImageName = this.currentImage?.file.name || null;
    if (this.canvasElement) {
      this.drawHotspots();
    }
  }

  previousImage() {
    if (this.currentIndex > 0) {
      this.loadImage(this.currentIndex - 1);
    }
  }

  nextImage() {
    if (this.currentIndex < this.images.length - 1) {
      this.loadImage(this.currentIndex + 1);
    }
  }

  goBack() {
    this.router.navigate(['/upload'], { state: { images: this.images } });
  }

  loadImagesFromDB() {
    this.imageService.getImages().subscribe((images: ImageData[]) => {
      this.images = images;
      if (this.images.length > 0) {
        this.loadImage(this.currentIndex);
      }
    });
  }

  onImageLoad(event: Event) {
    const canvas = this.canvasElement.nativeElement;
    const image = event.target as HTMLImageElement;
    canvas.width = image.width;
    canvas.height = image.height;
    this.drawHotspots();
  }

  clearAllHotspots() {
    if (this.currentImage) {
      this.currentImage.hotspots = [];
      this.imageService.updateImage(this.currentImage).subscribe(() => {
        this.drawHotspots();
      });
    }
  }

  private drawHotspots() {
    if (!this.canvasElement || !this.currentImage) {
      return;
    }

    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    const hotspots = this.currentImage?.hotspots || [];
    hotspots.forEach(hotspot => {
      context.strokeStyle = '#006fff';
      context.lineWidth = 1;
      context.strokeRect(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
      context.fillStyle = 'rgba(0, 111, 255, 0.2)';
      context.fillRect(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
    });
  }

  showHotspotModal(index: number) {
    if (this.mode === 'build') {
      console.log('Showing modal for hotspot index:', index);
      this.selectedHotspotIndex = index;
      this.selectedHotspotImageName = this.currentImage?.hotspots![index].selectedImageName || null;
      this.showModal = true;
    }
  }

  closeModal() {
    this.showModal = false;
  }

  handleSelectionChange(selectedImageName: string) {
    if (this.currentImage && this.selectedHotspotIndex !== null) {
      this.currentImage.hotspots![this.selectedHotspotIndex].selectedImageName = selectedImageName;
      this.imageService.updateImage(this.currentImage).subscribe(() => {
        console.log('Hotspot updated with selected image name:', selectedImageName);
      });
    }
  }

  generateHtmlFile() {
    const htmlContent = this.htmlGenerationService.generateHtml(this.images);
    this.htmlGenerationService.downloadHtmlFile(htmlContent);
  }

  switchToPlayMode() {
    this.mode = 'play';
  }

  switchToBuildMode() {
    this.mode = 'build';
  }

  onHotspotClick(hotspot: Hotspot) {
    if (this.mode === 'play' && hotspot.selectedImageName) {
      const targetIndex = this.images.findIndex(image => image.file.name === hotspot.selectedImageName);
      if (targetIndex !== -1) {
        this.loadImage(targetIndex);
      }
    } else if (this.mode === 'build') {
      const index = this.currentImage?.hotspots?.indexOf(hotspot) || 0;
      this.showHotspotModal(index);
    }
  }
}
