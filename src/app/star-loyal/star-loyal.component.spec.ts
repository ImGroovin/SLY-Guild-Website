import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarLoyalComponent } from './star-loyal.component';

describe('StarLoyalComponent', () => {
  let component: StarLoyalComponent;
  let fixture: ComponentFixture<StarLoyalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarLoyalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarLoyalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
