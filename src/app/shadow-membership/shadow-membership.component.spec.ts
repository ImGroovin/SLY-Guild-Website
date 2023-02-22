import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShadowMembershipComponent } from './shadow-membership.component';

describe('ShadowMembershipComponent', () => {
  let component: ShadowMembershipComponent;
  let fixture: ComponentFixture<ShadowMembershipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShadowMembershipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShadowMembershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
