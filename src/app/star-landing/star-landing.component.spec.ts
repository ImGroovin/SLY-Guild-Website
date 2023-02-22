import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarLandingComponent } from './star-landing.component';

describe('StarLandingComponent', () => {
  let component: StarLandingComponent;
  let fixture: ComponentFixture<StarLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarLandingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
