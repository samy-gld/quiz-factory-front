import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizLauncherComponent } from './quiz-launcher.component';

describe('QuizLauncherComponent', () => {
  let component: QuizLauncherComponent;
  let fixture: ComponentFixture<QuizLauncherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizLauncherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizLauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
