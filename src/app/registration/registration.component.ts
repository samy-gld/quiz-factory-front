import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {IUser} from '../model/IUser';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  registerForm: FormGroup;

  constructor(private authenticationService: AuthenticationService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    const user: IUser = {
      username: this.registerForm.controls.username.value,
      email: this.registerForm.controls.email.value,
      plainPassword: this.registerForm.controls.password.value
    };
    this.authenticationService.register(user)
        .pipe(first())
        .subscribe(
            token => this.router.navigate(['/']),
            error => console.log('Erreur lors de l\'inscription :', error)
        );
  }
}
