import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShadowCodeComponent } from './shadow-code.component';

describe('ShadowCodeComponent', () => {
  let component: ShadowCodeComponent;
  let fixture: ComponentFixture<ShadowCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShadowCodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShadowCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
