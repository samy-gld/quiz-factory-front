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

@NgModule({
    declarations: [
        QuizFormComponent,
        QuizListComponent,
        QuestionFormComponent,
        PreviewComponent
    ],
    imports: [
        CommonModule,
        QuizMakerRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        HttpClientModule
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
