import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from '../../model/IUser';
import { first } from 'rxjs/operators';
import { ErrorManagerService } from '../../services/error-manager.service';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

    registerForm: FormGroup;
    buttonDisabled = false;
    isSubmitted = false;
    isEmailUsed = false;
    isUsernameUsed = false;
    registered = false;

    constructor(private authenticationService: AuthenticationService,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private errorManager: ErrorManagerService) { }

    ngOnInit() {
        this.registerForm = new FormGroup({
            username: new FormControl('', [Validators.required, Validators.minLength(4)]),
            email: new FormControl('', [Validators.required, validateEmail]),
            password: new FormControl('', [Validators.required, Validators.minLength(4)]),
            confirmPassword: new FormControl('', [Validators.required])
        });
    }

    get username() {
        return this.registerForm.controls.username;
    }

    get email() {
        return this.registerForm.controls.email;
    }

    get password() {
        return this.registerForm.controls.password;
    }

    get confirmPassword() {
        return this.registerForm.controls.confirmPassword;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isEmailUsed = false;
        this.isUsernameUsed = false;
        if (this.registerForm.invalid) {
            return;
        }

        this.buttonDisabled = true;

        const user: IUser = {
            username: this.username.value,
            email: this.email.value,
            plainPassword: this.password.value
        };
        this.authenticationService.register(user)
            .pipe(first())
            .subscribe(
                () => this.registered = true,
                error => {
                    this.buttonDisabled = false;
                    this.errorManager.manageError(error);
                    if (error.error.message === 'Email already used') {
                        this.isEmailUsed = true;
                    } else if (error.error.message === 'Username already used') {
                        this.isUsernameUsed = true;
                    }
                    console.log('Erreur lors de l\'inscription :', error);
                }
            );
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
