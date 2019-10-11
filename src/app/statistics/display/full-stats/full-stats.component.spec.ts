import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullStatsComponent } from './full-stats.component';

describe('DisplayStatsComponent', () => {
  let component: FullStatsComponent;
  let fixture: ComponentFixture<FullStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
