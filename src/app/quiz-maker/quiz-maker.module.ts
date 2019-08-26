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
import { InviteParticipantsComponent } from './invite-partcipants/invite-participants.component';
import { StoreModule } from '@ngrx/store';
import { quizReducer } from './store/reducers/quiz.reducer';
import { questionReducer } from './store/reducers/question.reducer';
import { EffectsModule } from '@ngrx/effects';
import { QuizEffects } from './store/effects/quiz.effects';
import { QuestionEffects } from './store/effects/question.effects';
import { QuestionComponent } from './question-form/question/question.component';
import { QuizExecService } from './services/quiz-exec.service';

@NgModule({
    declarations: [
        QuizFormComponent,
        QuizListComponent,
        QuestionFormComponent,
        PreviewComponent,
        InviteParticipantsComponent,
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
        QuestionService,
        QuizExecService
    ],
    exports: [
        QuizFormComponent,
        QuizListComponent,
        QuestionFormComponent,
        PreviewComponent
    ]
})
export class QuizMakerModule { }
