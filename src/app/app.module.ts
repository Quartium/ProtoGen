import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ViewerComponent } from './components/viewer/viewer.component';
import { UploadComponent } from './components/upload/upload.component';
import { ModalComponent } from './components/modal/modal.component';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
import { ImageService } from './services/image.service';
import { HotspotDrawingDirective } from './directives/hotspot-drawing.directive';
import { HtmlGenerationService } from './services/html-generation.service';

const dbConfig: DBConfig = {
  name: 'MyDB',
  version: 1,
  objectStoresMeta: [{
    store: 'images',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'file', keypath: 'file', options: { unique: false } },
      { name: 'src', keypath: 'src', options: { unique: false } },
    ]
  }]
};

@NgModule({
  declarations: [
    AppComponent,
    ViewerComponent,
    UploadComponent,
    ModalComponent,
    HotspotDrawingDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxIndexedDBModule.forRoot(dbConfig)
  ],
  providers: [
    ImageService,
    HtmlGenerationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
