import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterBirthComponent } from './center-birth.component';

describe('CenterBirthComponent', () => {
  let component: CenterBirthComponent;
  let fixture: ComponentFixture<CenterBirthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterBirthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CenterBirthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
