import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShadowOpsComponent } from './shadow-ops.component';

describe('ShadowOpsComponent', () => {
  let component: ShadowOpsComponent;
  let fixture: ComponentFixture<ShadowOpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShadowOpsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShadowOpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
