import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizExecutionComponent } from './quiz-execution.component';

describe('QuizExecutionComponent', () => {
  let component: QuizExecutionComponent;
  let fixture: ComponentFixture<QuizExecutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizExecutionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
