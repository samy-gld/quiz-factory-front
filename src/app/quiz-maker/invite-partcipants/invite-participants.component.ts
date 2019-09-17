import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Invitation } from '../../model/IInvitation';
import { Quiz } from '../../model/IQuiz';
import { Store } from '@ngrx/store';
import { QuestionState, selectCurrentQuiz } from '../store/reducers/question.reducer';
import { Observable } from 'rxjs';
import { InviteParticipant } from '../store/actions/quiz.actions';
import { tap } from 'rxjs/operators';
import { QuizState, selectInvitations } from '../store/reducers/quiz.reducer';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-invite-participants',
    templateUrl: './invite-participants.component.html',
    styleUrls: ['./invite-participants.component.css']
})
export class InviteParticipantsComponent implements OnInit {

    @Output() closeInvite: EventEmitter<boolean> = new EventEmitter<boolean>();
    currentQuiz$: Observable<Quiz>;
    invitations$: Observable<Invitation[]>;
    inviteForm: FormGroup;
    buttonDisabled = false;
    isSubmitted = false;
    currentQuizId: number;
    executionUrl = environment.SelfUrl + '/execute';

    constructor(private questionStore: Store<QuestionState>,
                private quizStore: Store<QuizState>) { }

    ngOnInit() {
        this.currentQuiz$ = this.questionStore.select(selectCurrentQuiz).pipe(
            tap(quiz => this.currentQuizId = quiz.id)
        );
        this.invitations$ = this.quizStore.select(selectInvitations);
        this.inviteForm = new FormGroup({
            firstname: new FormControl('', [Validators.required, Validators.minLength(4)]),
            lastname: new FormControl('', [Validators.required, Validators.minLength(4)]),
            email: new FormControl('', [Validators.required, validateEmail])
        });
    }

    get firstname() {
        return this.inviteForm.controls.firstname;
    }

    get lastname() {
        return this.inviteForm.controls.lastname;
    }

    get email() {
        return this.inviteForm.controls.email;
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.inviteForm.invalid) {
            return;
        }
        // this.buttonDisabled = true;

        const invitation: Invitation = {
            firstname: this.firstname.value,
            lastname: this.lastname.value,
            email: this.email.value,
            // token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            quiz: this.currentQuizId
        };
        this.questionStore.dispatch(InviteParticipant({invitation}));
    }
}

function validateEmail(control: AbstractControl): ValidationErrors | null {
    // tslint:disable-next-line:max-line-length
    const email = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (email && !email.test(control.value)) {
        return {invalidEmail: true};
    } else {
        return null;
    }
}
