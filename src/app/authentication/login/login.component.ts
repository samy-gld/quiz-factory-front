import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IUser } from '../../model/IUser';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ErrorManagerService } from '../../services/error-manager.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;
    returnUrl: string;
    buttonDisabled = false;
    isSubmitted = false;

    constructor(private authenticationService: AuthenticationService,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private errorManager: ErrorManagerService) { }

    ngOnInit() {
        this.loginForm = new FormGroup({
            username: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required)
        });
        this.returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl || '/';
    }

    get username() {
        return this.loginForm.controls.username;
    }

    get password() {
        return this.loginForm.controls.password;
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.loginForm.invalid) {
            return;
        }

        this.buttonDisabled = true;

        const user: IUser = {
            username: this.loginForm.controls.username.value,
            password: this.loginForm.controls.password.value
        };
        this.authenticationService.login(user)
            .pipe(
                first())
            .subscribe(
                () => this.router.navigate([this.returnUrl]),
                error => {
                    this.buttonDisabled = false;
                    this.errorManager.manageError(error);
                    console.log('Authentication error :', error);
                }
            );
    }
}
