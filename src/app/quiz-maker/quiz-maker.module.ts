import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizFormComponent } from './quiz-form/quiz-form.component';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { PreviewComponent } from './preview/preview.component';
import { QuestionService } from './services/question.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuizMakerRoutingModule } from './quiz-maker-routing.module';
import { InviteParticipantsComponent } from './invite-partcipants/invite-participants.component';
import { StoreModule } from '@ngrx/store';
import { quizReducer } from './store/reducers/quiz.reducer';
import { questionReducer } from './store/reducers/question.reducer';
import { EffectsModule } from '@ngrx/effects';
import { QuizEffects } from './store/effects/quiz.effects';
import { QuestionEffects } from './store/effects/question.effects';
import { QuestionComponent } from './question-form/question/question.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

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
        ButtonsModule,
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        StoreModule.forFeature('quizzes', quizReducer),
        StoreModule.forFeature('questions', questionReducer),
        EffectsModule.forFeature([QuizEffects, QuestionEffects])
    ],
    providers: [
        QuestionService
    ],
    exports: [
        QuizFormComponent,
        QuizListComponent,
        QuestionFormComponent,
        PreviewComponent,
        InviteParticipantsComponent,
        QuestionComponent
    ]
})
export class QuizMakerModule { }
