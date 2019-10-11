import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ByQuizStatsComponent } from './by-quiz-stats.component';

describe('ByQuizStatsComponent', () => {
  let component: ByQuizStatsComponent;
  let fixture: ComponentFixture<ByQuizStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ByQuizStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ByQuizStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
