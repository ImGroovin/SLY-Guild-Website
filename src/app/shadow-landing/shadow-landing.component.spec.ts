import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShadowLandingComponent } from './shadow-landing.component';

describe('ShadowLandingComponent', () => {
  let component: ShadowLandingComponent;
  let fixture: ComponentFixture<ShadowLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShadowLandingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShadowLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
