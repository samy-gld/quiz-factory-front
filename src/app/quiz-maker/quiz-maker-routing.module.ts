import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuizFormComponent } from './quiz-form/quiz-form.component';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { PreviewComponent } from './preview/preview.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { InviteParticipantsComponent } from './invite-partcipants/invite-participants.component';
import { AuthenticationGuard } from '../authentication/services/authentication.guard';

const routes: Routes = [
    { path: 'quiz/edit',         canActivate: [AuthenticationGuard], component: QuizFormComponent },
    { path: 'quiz/edit/:id',     canActivate: [AuthenticationGuard], component: QuizFormComponent },
    { path: 'quiz/list',         canActivate: [AuthenticationGuard], component: QuizListComponent },
    { path: 'quiz/preview/:id',  canActivate: [AuthenticationGuard], component: PreviewComponent },
    { path: 'quiz/generate/:id', canActivate: [AuthenticationGuard], component: QuestionFormComponent },
    { path: 'quiz/invite',       canActivate: [AuthenticationGuard], component: InviteParticipantsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class QuizMakerRoutingModule { }
