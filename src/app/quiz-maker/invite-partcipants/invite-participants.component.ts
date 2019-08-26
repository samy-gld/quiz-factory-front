import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { InvitedUser } from '../../model/IInvitedUser';
import { Quiz } from '../../model/IQuiz';
import { Store } from '@ngrx/store';
import { QuestionState, selectCurrentQuiz } from '../store/reducers/question.reducer';
import { Observable } from 'rxjs';
import {InviteParticipant} from '../store/actions/quiz.actions';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-invite-participants',
    templateUrl: './invite-participants.component.html',
    styleUrls: ['./invite-participants.component.css']
})
export class InviteParticipantsComponent implements OnInit {

    @Output() closeInvite: EventEmitter<boolean> = new EventEmitter<boolean>();
    currentQuiz$: Observable<Quiz>;
    inviteForm: FormGroup;
    buttonDisabled = false;
    isSubmitted = false;
    currentQuizId: number;

    constructor(private questionStore: Store<QuestionState>) { }

    ngOnInit() {
        this.currentQuiz$ = this.questionStore.select(selectCurrentQuiz)
            .pipe(
                tap(quiz => this.currentQuizId = quiz.id)
            );
        this.inviteForm = new FormGroup({
            firstname: new FormControl('', [Validators.required]),
            lastname: new FormControl('', [Validators.required]),
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
        this.buttonDisabled = true;

        const invitedUser: InvitedUser = {
            firstname: this.firstname.value,
            lastname: this.lastname.value,
            email: this.email.value
        };
        this.questionStore.dispatch(InviteParticipant({quizId: this.currentQuizId, invitedUser}));
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
