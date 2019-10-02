import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {map, take, withLatestFrom} from 'rxjs/operators';
import { Question } from '../../../model/IQuiz';

@Component({
  selector: 'app-question',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent {

  @Input() questionForm$: Observable<FormGroup>;
  @Input() propositions$: Observable<any[]>;
  @Input() currentQuestion$: Observable<Question>;
  @Input() quizFinalized: boolean;
  @Output() deleteQuestionEvent: EventEmitter<any> = new EventEmitter<any>();

  typeLength = {duo: 2, carre: 4, qcm: 6};

  constructor() { }

  updateQuestionType(event: any): void {
    const type = event.target.value;
    this.questionForm$.pipe(
        take(1),
        withLatestFrom(
            this.currentQuestion$
        ),
        map(
            ([questionFormGroup, currentQuestion]) => {
              const propArray             = questionFormGroup.get('propositions') as FormArray;
              const currentPropFormLength = propArray.length;
              const diffFields            = this.typeLength[type] - currentPropFormLength;

              if (diffFields > 0) {
                for (let i = 0; i < diffFields; i++) {
                  let id: number;
                  let position        = i + currentPropFormLength + 1;
                  let wrightAnswer    = false;
                  let label           = '';
                  if (currentQuestion !== null && currentQuestion.propositions !== undefined) {
                    const proposition = currentQuestion.propositions[i + currentPropFormLength];
                    if (proposition !== undefined) {
                      id              = proposition.id;
                      position        = proposition.position;
                      wrightAnswer    = proposition.wrightAnswer;
                      label           = proposition.label;
                    }
                  }
                  propArray.push(new FormGroup(
                      {
                        id:             new FormControl(id),
                        position:       new FormControl(position),
                        wrightAnswer:   new FormControl(wrightAnswer),
                        label:          new FormControl(label)
                      }
                  ));
                }
              } else if (diffFields < 0) {
                for (let i = 0; i > diffFields; i--) {
                  propArray.controls.pop();
                }
              }

              const newPropFormLength = propArray.length;
              for (let i = 0; i < newPropFormLength; i++) {
                propArray.controls[i].get('wrightAnswer').setValue(false);
              }
              questionFormGroup.get('questionType').setValue(type);
              return questionFormGroup;
            }
        )
    ).subscribe(
        (qfg: FormGroup) => this.questionForm$ = of(qfg)
    );
  }

  uncheckOthers(event: any): void {
    const eventTarget = event.currentTarget as HTMLInputElement;
    const checkId = eventTarget.id;
    const id = Number(checkId.slice(6, checkId.length)); // checkbox id = 'check_' + index

    this.questionForm$.pipe(
        take(1),
        map((questionForm: FormGroup) => {
              const propFormArray = questionForm.get('propositions') as FormArray;
              const propFormLength = propFormArray.length;
              const val = propFormArray.controls[id].get('wrightAnswer').value;
              if (questionForm.get('questionType').value !== 'qcm') {
                for (let i = 0; i < propFormLength; i++) {
                  if (id === i) {
                    propFormArray.controls[i].get('wrightAnswer').setValue(val);
                  } else {
                    propFormArray.controls[i].get('wrightAnswer').setValue(false);
                  }
                }
              }
              return questionForm as FormGroup;
            }
        )).subscribe(
        (qfg: FormGroup) => this.questionForm$ = of(qfg)
    );
  }

    deleteQuestion() {
        this.deleteQuestionEvent.emit();
    }
}
