import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { QuizFormComponent } from './quiz-form/quiz-form.component';
import { QuizService } from './services/quiz.service';
import { HttpClientModule } from '@angular/common/http';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { DynamicService } from './services/dynamic.service';
import { QuestionFormComponent } from './question-form/question-form.component';
import { QuestionService } from './services/question.service';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './store/effects/app.effects';
import { QuizEffects } from './store/effects/quiz.effects';
import { reducers, metaReducers } from './store/reducers';
import { QuestionEffects } from './store/effects/question.effects';
import { quizReducer } from './store/reducers/quiz.reducer';
import { questionReducer } from './store/reducers/question.reducer';

const AppRoutes: Routes = [
  { path: 'quiz/edit', component: QuizFormComponent },
  { path: 'quiz/edit/:id', component: QuizFormComponent },
  { path: 'quiz/list', component: QuizListComponent },
  { path: 'question/edit/:id', component: QuestionFormComponent, runGuardsAndResolvers: 'always' },
  { path: '', redirectTo: 'quiz/list', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    QuizFormComponent,
    QuizListComponent,
    QuestionFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(AppRoutes, { onSameUrlNavigation: 'reload' }),
    StoreModule.forRoot({}),
    // StoreModule.forRoot(reducers, { metaReducers }),
    StoreModule.forFeature('quizzes', quizReducer),
    StoreModule.forFeature('questions', questionReducer),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forRoot([AppEffects, QuizEffects, QuestionEffects])
  ],
  providers: [
    QuizService,
    QuestionService,
    DynamicService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
