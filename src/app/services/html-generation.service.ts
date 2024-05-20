import { Injectable } from '@angular/core';
import { ImageData } from '../models/image-data.model';

@Injectable({
  providedIn: 'root'
})
export class HtmlGenerationService {

  generateHtml(images: ImageData[]): string {
    let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProtoGen</title>
  <style>
    body, html {
      height: 100%;
      margin: 0;
      font-family: Arial, sans-serif;
    }
    body {
      display: flex;
      justify-content: flex-start;
    }
    .image-container {
      height: 100%;
      position: relative;
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      margin: 0 auto;
    }
    .screen {
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
    }
    .hotspot {
      position: absolute;
      border: 1px solid #006fff;
      background: rgba(0, 111, 255, .2);
      border-radius: 4px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.5s;
    }
  </style>
</head>
<body>
  <div class="image-container">
    <img src="${images[0].src}" alt="Display Image" id="display-image">
    ${this.generateScreensHtml(images)}
  </div>
  <script>
    document.body.addEventListener('click', function (e) {
      if (e.target.classList.contains('hotspot')) {
        const targetScreenId = e.target.dataset.target;
        const imageFile = e.target.dataset.image;
        const displayImage = document.getElementById('display-image');
        displayImage.src = imageFile;
        document.querySelectorAll('.screen').forEach(screen => {
          screen.style.display = screen.id === targetScreenId ? 'block' : 'none';
        });
      }
      if (e.target.classList.contains('screen') || e.target.classList.contains('hotspot')) {
        const hotspots = document.querySelectorAll('.hotspot');
        hotspots.forEach(hotspot => {
          hotspot.style.opacity = "1";
        });
        setTimeout(() => {
          hotspots.forEach(hotspot => {
            hotspot.style.opacity = "0";
          });
        }, 300);
      }
    });
  </script>
</body>
</html>`;
    return htmlContent;
  }

  private generateScreensHtml(images: ImageData[]): string {
    return images.map((image, index) => {
      const screenId = `screen${index + 1}`;
      const hotspotsHtml = (image.hotspots || []).map(hotspot => {
        const targetScreenIndex = images.findIndex(img => img.file.name === hotspot.selectedImageName);
        const targetScreenId = `screen${targetScreenIndex + 1}`;
        const targetImageSrc = images[targetScreenIndex]?.src;
        return `<div class="hotspot" data-target="${targetScreenId}" data-image="${targetImageSrc}" style="left: ${hotspot.x}px; top: ${hotspot.y}px; width: ${hotspot.width}px; height: ${hotspot.height}px;"></div>`;
      }).join('');
      return `
        <div class="screen" id="${screenId}" style="display: ${index === 0 ? 'block' : 'none'};">
          ${hotspotsHtml}
        </div>`;
    }).join('');
  }

  downloadHtmlFile(htmlContent: string) {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'generated.html';
    link.click();
  }
}
