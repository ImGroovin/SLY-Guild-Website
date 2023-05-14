import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolSageComponent } from './tool-sage.component';

describe('ToolSageComponent', () => {
  let component: ToolSageComponent;
  let fixture: ComponentFixture<ToolSageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToolSageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolSageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
