import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderWordComponent } from './leader-word.component';

describe('LeaderWordComponent', () => {
  let component: LeaderWordComponent;
  let fixture: ComponentFixture<LeaderWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderWordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeaderWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
