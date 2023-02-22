import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarServicesComponent } from './star-services.component';

describe('StarServicesComponent', () => {
  let component: StarServicesComponent;
  let fixture: ComponentFixture<StarServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
