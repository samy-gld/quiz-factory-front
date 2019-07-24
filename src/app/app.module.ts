import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { QuizFormComponent } from './quiz-form/quiz-form.component';
import { QuizService } from './services/quiz.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { DynamicService } from './services/dynamic.service';
import { QuestionFormComponent } from './question-form/question-form.component';
import { QuestionService } from './services/question.service';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { QuizEffects } from './store/effects/quiz.effects';
import { QuestionEffects } from './store/effects/question.effects';
import { quizReducer } from './store/reducers/quiz.reducer';
import { questionReducer } from './store/reducers/question.reducer';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { AuthenticationGuard } from './services/authentication.guard';
import { AuthenticationService } from './services/authentication.service';
import { LogoutComponent } from './logout/logout.component';
import {AuthInterceptorService} from './services/auth-interceptor.service';

const AppRoutes: Routes = [
  { path: 'register', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'quiz/edit', component: QuizFormComponent, canActivate: [AuthenticationGuard] },
  { path: 'quiz/edit/:id', component: QuizFormComponent, canActivate: [AuthenticationGuard] },
  { path: 'quiz/list', component: QuizListComponent, canActivate: [AuthenticationGuard] },
  { path: 'question/edit/:id', component: QuestionFormComponent, canActivate: [AuthenticationGuard], runGuardsAndResolvers: 'always' },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  declarations: [
    AppComponent,
    QuizFormComponent,
    QuizListComponent,
    QuestionFormComponent,
    RegistrationComponent,
    LoginComponent,
    LogoutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forRoot(AppRoutes, { onSameUrlNavigation: 'reload' }),
    StoreModule.forRoot({}),
    StoreModule.forFeature('quizzes', quizReducer),
    StoreModule.forFeature('questions', questionReducer),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forRoot([QuizEffects, QuestionEffects])
  ],
  providers: [
    QuizService,
    QuestionService,
    DynamicService,
    AuthenticationService,
    AuthenticationGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
