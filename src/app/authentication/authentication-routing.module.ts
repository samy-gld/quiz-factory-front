import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import {ConfirmRegisterComponent} from './confirm-register/confirm-register.component';

const routes: Routes = [
    {
        path: 'register',
        component: RegistrationComponent
    },
    {
        path: 'confirm/:token',
        component: ConfirmRegisterComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'logout',
        component: LogoutComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
