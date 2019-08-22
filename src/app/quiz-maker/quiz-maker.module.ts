import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizFormComponent } from './quiz-form/quiz-form.component';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { PreviewComponent } from './preview/preview.component';
import { QuestionService } from './services/question.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { QuizMakerRoutingModule } from './quiz-maker-routing.module';
import { InvitePartcipantsComponent } from './invite-partcipants/invite-partcipants.component';
import { StoreModule } from '@ngrx/store';
import { quizReducer } from './store/reducers/quiz.reducer';
import { questionReducer } from './store/reducers/question.reducer';
import { EffectsModule } from '@ngrx/effects';
import { QuizEffects } from './store/effects/quiz.effects';
import { QuestionEffects } from './store/effects/question.effects';
import { QuestionComponent } from './question-form/question/question.component';

@NgModule({
    declarations: [
        QuizFormComponent,
        QuizListComponent,
        QuestionFormComponent,
        PreviewComponent,
        InvitePartcipantsComponent,
        QuestionComponent
    ],
    imports: [
        CommonModule,
        QuizMakerRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        HttpClientModule,
        StoreModule.forFeature('quizzes', quizReducer),
        StoreModule.forFeature('questions', questionReducer),
        EffectsModule.forFeature([QuizEffects, QuestionEffects]),
    ],
    providers: [
        QuestionService
    ],
    exports: [
        QuizFormComponent,
        QuizListComponent,
        QuestionFormComponent,
        PreviewComponent
    ]
})
export class QuizMakerModule { }
