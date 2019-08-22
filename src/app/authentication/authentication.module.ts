import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { RegistrationComponent } from './registration/registration.component';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { AuthenticationGuard } from './services/authentication.guard';
import { AuthenticationService } from './services/authentication.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { passwordMatchDirective } from './validators/passwordMatchValidator';
import { ConfirmRegisterComponent } from './confirm-register/confirm-register.component';

@NgModule({
    declarations: [
        LoginComponent,
        LogoutComponent,
        RegistrationComponent,
        passwordMatchDirective,
        ConfirmRegisterComponent
    ],
    imports: [
        CommonModule,
        AuthenticationRoutingModule,
        ReactiveFormsModule,
        HttpClientModule
    ],
    providers: [
        AuthInterceptorService,
        AuthenticationGuard,
        AuthenticationService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true
        }
    ],
    exports: [
        LoginComponent,
        LogoutComponent,
        RegistrationComponent
    ]
})
export class AuthenticationModule { }
