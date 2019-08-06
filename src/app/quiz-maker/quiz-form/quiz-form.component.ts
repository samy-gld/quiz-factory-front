import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz } from '../../model/IQuiz';
import { select, Store } from '@ngrx/store';
import { CreateQuiz, UpdateQuiz } from '../../store/actions/quiz.actions';
import { QuizState } from '../../store/reducers/quiz.reducer';
import { QuestionState, selectCurrentQuiz, selectErrorSaving } from '../../store/reducers/question.reducer';
import { LoadQuiz, ResetErrorSaving } from '../../store/actions/question.actions';
import { filter, skip, skipWhile, take } from 'rxjs/operators';

@Component({
    selector: 'app-quiz-form',
    templateUrl: './quiz-form.component.html',
    styleUrls: ['./quiz-form.component.css']
})
export class QuizFormComponent implements OnInit {
    quiz: Quiz = {name: '', description: ''} as Quiz;
    quizId: number | undefined;
    loadingQuiz = false;
    buttonDisabled = false;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private store: Store<QuizState>,
                private questionStore: Store<QuestionState>) {}

    ngOnInit() {
        this.quizId = this.activatedRoute.snapshot.params.id as number;
        if (this.quizId !== undefined) {
            this.questionStore.dispatch(LoadQuiz({id: this.quizId}));
            this.loadingQuiz = true;
            this.questionStore.pipe(
                select(selectCurrentQuiz),
                skip(1),
                skipWhile(quiz => quiz === null),
                take(1)
            ).subscribe(
                quiz => {
                    this.quiz = quiz;
                    this.loadingQuiz = false;
                }
            );
        }
    }

    onSubmit(f: NgForm) {
        this.buttonDisabled = true;

        const quizToSave: Quiz = {
            name: f.value.quizName,
            description: f.value.quizDesc,
            status: 'pending'
        };

        if (this.quiz.id !== undefined) {
            quizToSave.id = this.quiz.id;
            this.store.dispatch(UpdateQuiz({quiz: quizToSave}));
        } else {
            this.store.dispatch(CreateQuiz({quiz: quizToSave}));
        }

        this.questionStore.pipe(
            select(selectErrorSaving),
            filter(error => !!error)
        ).subscribe(
            () => {
                this.buttonDisabled = false;
                this.questionStore.dispatch(ResetErrorSaving());
            }
        ).unsubscribe();
    }
}
