import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
import { ImageData } from '../models/image-data.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private dbService: NgxIndexedDBService) { }

  addImage(image: ImageData): Observable<any> {
    return this.dbService.add('images', image);
  }

  getImages(): Observable<ImageData[]> {
    return this.dbService.getAll('images');
  }

  deleteImage(id: number): Observable<any> {
    return this.dbService.delete('images', id);
  }

  clearImages(): Observable<any> {
    return this.dbService.clear('images');
  }

  updateImage(image: ImageData): Observable<any> {
    return this.dbService.update('images', image);
  }
}
