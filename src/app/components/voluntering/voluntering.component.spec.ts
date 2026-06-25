import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteringComponent } from './voluntering.component';

describe('VolunteringComponent', () => {
  let component: VolunteringComponent;
  let fixture: ComponentFixture<VolunteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteringComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VolunteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
