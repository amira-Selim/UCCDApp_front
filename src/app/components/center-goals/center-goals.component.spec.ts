import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterGoalsComponent } from './center-goals.component';

describe('CenterGoalsComponent', () => {
  let component: CenterGoalsComponent;
  let fixture: ComponentFixture<CenterGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterGoalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CenterGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
