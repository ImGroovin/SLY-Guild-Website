import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShadowLoyalComponent } from './shadow-loyal.component';

describe('ShadowLoyalComponent', () => {
  let component: ShadowLoyalComponent;
  let fixture: ComponentFixture<ShadowLoyalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShadowLoyalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShadowLoyalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
