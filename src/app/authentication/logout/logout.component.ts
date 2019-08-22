import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import {Store} from '@ngrx/store';
import {QuizState} from '../../quiz-maker/store/reducers/quiz.reducer';
import {Logout} from '../../quiz-maker/store/actions/quiz.actions';

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

    constructor(private authenticationService: AuthenticationService,
                private quizStore: Store<QuizState>,
                private router: Router) { }

    ngOnInit() {
        this.quizStore.dispatch(Logout());
        this.authenticationService.logout();
        this.router.navigate(['/']);
    }

}
