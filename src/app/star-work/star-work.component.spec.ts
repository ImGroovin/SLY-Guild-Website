import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarWorkComponent } from './star-work.component';

describe('StarWorkComponent', () => {
  let component: StarWorkComponent;
  let fixture: ComponentFixture<StarWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarWorkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
