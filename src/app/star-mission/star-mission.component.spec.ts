import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarMissionComponent } from './star-mission.component';

describe('StarMissionComponent', () => {
  let component: StarMissionComponent;
  let fixture: ComponentFixture<StarMissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarMissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarMissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
