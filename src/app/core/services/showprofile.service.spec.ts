import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ShowProfileService } from './showprofile.service';

describe('ShowProfileService', () => {
  let service: ShowProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ShowProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
