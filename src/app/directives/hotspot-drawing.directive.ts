import { Directive, ElementRef, HostListener, Input, OnChanges, Renderer2, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ImageService } from '../services/image.service';
import { Hotspot } from '../models/hotspot.model';
import { ImageData } from '../models/image-data.model';

@Directive({
  selector: '[appHotspotDrawing]'
})
export class HotspotDrawingDirective implements OnChanges {
  @Input('appHotspotDrawing') image: ImageData | undefined;
  @Output() hotspotClicked = new EventEmitter<number>();

  private isDrawing = false;
  private isDragging = false;
  private isResizing = false;
  private startX = 0;
  private startY = 0;
  private dragStartX = 0;
  private dragStartY = 0;
  private resizeStartX = 0;
  private resizeStartY = 0;
  private draggedHotspotIndex: number | null = null;
  private resizedHotspotIndex: number | null = null;
  private deleteButtons: HTMLDivElement[] = [];
  private resizeHandles: HTMLDivElement[] = [];
  private dragThreshold = 5;
  private hasDragged = false;

  constructor(private el: ElementRef<HTMLCanvasElement>, private imageService: ImageService, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['image']) {
      this.drawExistingHotspots();
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    const canvas = this.el.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.startX = event.clientX - rect.left;
    this.startY = event.clientY - rect.top;
    this.hasDragged = false;

    if (this.image) {
      const resizeHandleIndex = this.getResizeHandleAtPosition(this.startX, this.startY);
      if (resizeHandleIndex !== null) {
        this.isResizing = true;
        this.resizedHotspotIndex = resizeHandleIndex;
        this.resizeStartX = this.startX;
        this.resizeStartY = this.startY;
      } else {
        const hotspotIndex = this.getHotspotAtPosition(this.startX, this.startY);
        if (hotspotIndex !== null) {
          this.isDragging = true;
          this.draggedHotspotIndex = hotspotIndex;
          this.dragStartX = this.startX;
          this.dragStartY = this.startY;
        } else {
          this.isDrawing = true;
        }
      }
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDrawing && !this.isDragging && !this.isResizing) {
      this.setCursorStyle(event);
      return;
    }

    const canvas = this.el.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawExistingHotspots();

    if (this.isDrawing) {
      const width = x - this.startX;
      const height = y - this.startY;
      context.strokeStyle = '#006fff';
      context.lineWidth = 1;
      context.strokeRect(this.startX, this.startY, width, height);
      context.fillStyle = 'rgba(0, 111, 255, 0.2)';
      context.fillRect(this.startX, this.startY, width, height);
    } else if (this.isDragging && this.draggedHotspotIndex !== null) {
      const dx = x - this.dragStartX;
      const dy = y - this.dragStartY;
      if (Math.abs(dx) > this.dragThreshold || Math.abs(dy) > this.dragThreshold) {
        this.hasDragged = true;
      }
      this.updateDraggedHotspotPosition(dx, dy);
      this.drawExistingHotspots();
      this.dragStartX = x;
      this.dragStartY = y;
    } else if (this.isResizing && this.resizedHotspotIndex !== null) {
      const hotspot = this.image!.hotspots![this.resizedHotspotIndex];
      const newWidth = Math.max(10, hotspot.width + (x - this.resizeStartX));
      const newHeight = Math.max(10, hotspot.height + (y - this.resizeStartY));
      hotspot.width = newWidth;
      hotspot.height = newHeight;
      this.resizeStartX = x;
      this.resizeStartY = y;
      this.drawExistingHotspots();
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.isDrawing) {
      this.isDrawing = false;

      const canvas = this.el.nativeElement;
      const rect = canvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      let width = x - this.startX;
      let height = y - this.startY;

      if (width < 0) {
        x = this.startX;
        width = -width;
        this.startX = x - width;
      }
      if (height < 0) {
        y = this.startY;
        height = -height;
        this.startY = y - height;
      }

      if (width && height && this.image) {
        const hotspot: Hotspot = { x: this.startX, y: this.startY, width, height };
        if (this.image.hotspots) {
          this.image.hotspots.push(hotspot);
        } else {
          this.image.hotspots = [hotspot];
        }

        this.imageService.updateImage(this.image).subscribe(() => {
          this.drawExistingHotspots();
          if (!this.hasDragged) {
            console.log('Hotspot drawn, index:', this.image!.hotspots!.length - 1);
            this.hotspotClicked.emit(this.image!.hotspots!.length - 1);
          }
        });
      }
    }

    if (this.isDragging) {
      this.isDragging = false;
      if (!this.hasDragged && this.draggedHotspotIndex !== null) {
        console.log('Hotspot clicked, index:', this.draggedHotspotIndex);
        this.hotspotClicked.emit(this.draggedHotspotIndex);
      }
      this.draggedHotspotIndex = null;
      if (this.image) {
        this.imageService.updateImage(this.image).subscribe(() => {
          this.drawExistingHotspots();
        });
      }
    }

    if (this.isResizing) {
      this.isResizing = false;
      this.resizedHotspotIndex = null;
      if (this.image) {
        this.imageService.updateImage(this.image).subscribe(() => {
          this.drawExistingHotspots();
        });
      }
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    if (this.isDrawing || this.isDragging || this.isResizing) {
      this.isDrawing = false;
      this.isDragging = false;
      this.isResizing = false;
      this.draggedHotspotIndex = null;
      this.resizedHotspotIndex = null;
      this.drawExistingHotspots();
    }
  }

  private setCursorStyle(event: MouseEvent) {
    const canvas = this.el.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.getResizeHandleAtPosition(x, y) !== null) {
      this.renderer.setStyle(canvas, 'cursor', 'nwse-resize');
    } else if (this.getHotspotAtPosition(x, y) !== null) {
      this.renderer.setStyle(canvas, 'cursor', 'pointer');
    } else {
      this.renderer.setStyle(canvas, 'cursor', 'default');
    }
  }

  private drawExistingHotspots() {
    if (!this.image) return;

    const canvas = this.el.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    this.deleteButtons.forEach(button => this.renderer.removeChild(canvas.parentElement, button));
    this.deleteButtons = [];
    this.resizeHandles.forEach(handle => this.renderer.removeChild(canvas.parentElement, handle));
    this.resizeHandles = [];

    const hotspots = this.image.hotspots || [];
    hotspots.forEach((hotspot, index) => {
      context.strokeStyle = '#006fff';
      context.lineWidth = 1;
      context.strokeRect(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
      context.fillStyle = 'rgba(0, 111, 255, 0.2)';
      context.fillRect(hotspot.x, hotspot.y, hotspot.width, hotspot.height);
      this.createDeleteButton(hotspot, index);
      this.createResizeHandle(hotspot, index);
    });
  }

  private createDeleteButton(hotspot: Hotspot, index: number) {
    const canvas = this.el.nativeElement;
    const button = this.renderer.createElement('div');
    this.renderer.addClass(button, 'delete-box');
    this.renderer.setStyle(button, 'left', `${hotspot.x + hotspot.width - 10}px`);
    this.renderer.setStyle(button, 'top', `${hotspot.y - 10}px`);
    this.renderer.listen(button, 'click', () => this.deleteHotspot(index));
    this.renderer.appendChild(button, this.renderer.createText('X'));
    this.renderer.appendChild(canvas.parentElement, button);
    this.deleteButtons.push(button);
  }

  private createResizeHandle(hotspot: Hotspot, index: number) {
    const canvas = this.el.nativeElement;
    const handle = this.renderer.createElement('div');
    this.renderer.addClass(handle, 'resize-handle');
    this.renderer.setStyle(handle, 'left', `${hotspot.x + hotspot.width - 5}px`);
    this.renderer.setStyle(handle, 'top', `${hotspot.y + hotspot.height - 5}px`);
    this.renderer.appendChild(canvas.parentElement, handle);
    this.resizeHandles.push(handle);
  }

  private getHotspotAtPosition(x: number, y: number): number | null {
    if (!this.image) return null;
    const hotspots = this.image.hotspots || [];
    for (let i = 0; i < hotspots.length; i++) {
      const hotspot = hotspots[i];
      if (x >= hotspot.x && x <= hotspot.x + hotspot.width && y >= hotspot.y && y <= hotspot.y + hotspot.height) {
        return i;
      }
    }
    return null;
  }

  private getResizeHandleAtPosition(x: number, y: number): number | null {
    if (!this.image) return null;
    const hotspots = this.image.hotspots || [];
    for (let i = 0; i < hotspots.length; i++) {
      const hotspot = hotspots[i];
      const handleX = hotspot.x + hotspot.width - 5;
      const handleY = hotspot.y + hotspot.height - 5;
      if (x >= handleX && x <= handleX + 10 && y >= handleY && y <= handleY + 10) {
        return i;
      }
    }
    return null;
  }

  private updateDraggedHotspotPosition(dx: number, dy: number) {
    if (!this.image || this.draggedHotspotIndex === null) return;
    const hotspot = this.image.hotspots![this.draggedHotspotIndex];
    hotspot.x += dx;
    hotspot.y += dy;
  }

  private deleteHotspot(index: number) {
    if (!this.image || !this.image.hotspots) return;
    this.image.hotspots.splice(index, 1);
    this.imageService.updateImage(this.image).subscribe(() => {
      this.drawExistingHotspots();
    });
  }

  clearDeleteButtons() {
    const canvas = this.el.nativeElement;
    this.deleteButtons.forEach(button => this.renderer.removeChild(canvas.parentElement, button));
    this.deleteButtons = [];
    this.resizeHandles.forEach(handle => this.renderer.removeChild(canvas.parentElement, handle));
    this.resizeHandles = [];
  }
}
