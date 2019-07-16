import { Injectable, Output } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DynamicService {

  appTitleSubject = new BehaviorSubject<string>('Quiz Factory');
  actionSubject = new BehaviorSubject<string>('');
  infoQuizSubject = new BehaviorSubject<string>('');
  validationDisplaySubject = new BehaviorSubject<boolean>(false);

  constructor() { }

  emitAppTitle(newTitle: string) {
    this.appTitleSubject.next(newTitle);
  }

  emitAction(newAction: string) {
    this.actionSubject.next(newAction);
  }

  emitInfoQuiz(newInfoQuiz: string) {
    this.infoQuizSubject.next(newInfoQuiz);
  }

  emitValidationDisplay(newValidationDisplay: boolean) {
    this.validationDisplaySubject.next(newValidationDisplay);
  }
}
