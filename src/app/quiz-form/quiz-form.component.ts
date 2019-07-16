import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { QuizService } from '../services/quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicService } from '../services/dynamic.service';
import { Quiz } from '../model/IQuiz';
import { Store } from '@ngrx/store';
import * as fromRoot from '../store/reducers/quiz.reducer';
import { CreateQuiz } from '../store/actions/quiz.actions';


@Component({
    selector: 'app-quiz-form',
    templateUrl: './quiz-form.component.html',
    styleUrls: ['./quiz-form.component.css']
})
export class QuizFormComponent implements OnInit {
    quiz = {name: '', description: '', status: 'pending', questions: []} as Quiz;

    constructor(private quizService: QuizService,
                private dynamicService: DynamicService,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private store: Store<fromRoot.QuizState>) {}

    ngOnInit() {
        this.dynamicService.emitAction('Initialiser votre nouveau quiz');
        this.dynamicService.emitInfoQuiz('Saisissez les informations');

        this.quiz.id = this.activatedRoute.snapshot.params.id;
        if (!(this.quiz.id === undefined)) {
            this.quizService.getQuiz(this.quiz.id).subscribe(
                (response) => {
                    this.quiz.name = response.name;
                    this.quiz.description = response.description;
                },
                (error) => {
                    this.quiz.name = '';
                    this.quiz.description = '';
                }
            );
        } else {
            this.quiz.name = '';
            this.quiz.description = '';
        }
    }

    onSubmit(f: NgForm) {
        const quiz = {name: '', description: '', status: 'pending', questions: []} as Quiz;
        quiz.name = f.value.quizName;
        quiz.description = f.value.quizDesc;
        quiz.status = 'pending';

        if (!(this.quiz.id === undefined)) {
            quiz.id = this.quiz.id;
            this.quizService.updateQuiz(quiz);
            this.router.navigate(['/question/edit/', quiz.id]);
        } else {
            this.store.dispatch(CreateQuiz({quiz}));
        }
    }
}
