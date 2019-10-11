import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ByQuestionStatsComponent } from './by-question-stats.component';

describe('ByQuestionStatsComponent', () => {
  let component: ByQuestionStatsComponent;
  let fixture: ComponentFixture<ByQuestionStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ByQuestionStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ByQuestionStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
