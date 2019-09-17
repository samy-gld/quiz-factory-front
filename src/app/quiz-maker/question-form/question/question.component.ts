import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { filter, map } from 'rxjs/operators';
import { Question } from '../../../model/IQuiz';

@Component({
  selector: 'app-question',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {

  @Input() questionForm$: Observable<FormGroup>;
  @Input() currentQuestion: Question;
  @Input() quizFinalized: boolean;
  @Output() deleteQuestionEvent: EventEmitter<any> = new EventEmitter<any>();

  typeLength = {duo: 2, carre: 4, qcm: 6};

  constructor() { }

  ngOnInit() {
  }

  get propositions() {
    return this.questionForm$.pipe(
        filter(formGroup => formGroup !== null),
        map(
            (propositionFormGroup: FormGroup) =>
                Array.of(propositionFormGroup.get('propositions') as FormArray)[0].controls
        ));
  }

  updateQuestionType(event: any, reset = false): void {
    const type = event.target.value;
    this.questionForm$.pipe(
        map(
            questionFormGroup => {
              const propArray             = questionFormGroup.get('propositions') as FormArray;
              const currentPropFormLength = propArray.length;
              const diffFields            = this.typeLength[type] - currentPropFormLength;
              if (diffFields > 0) {
                for (let i = 0; i < diffFields; i++) {
                  let id: number;
                  let position        = i + currentPropFormLength + 1;
                  let wrightAnswer    = false;
                  let label           = '';
                  if (this.currentQuestion !== null && this.currentQuestion.propositions !== undefined) {
                    const proposition = this.currentQuestion.propositions[i + currentPropFormLength];
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
                if (reset) {
                  propArray.controls[i].get('label').setValue('');
                }
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
