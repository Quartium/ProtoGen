import { TestBed } from '@angular/core/testing';

import { HtmlGenerationService } from './html-generation.service';

describe('HtmlGenerationService', () => {
  let service: HtmlGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
