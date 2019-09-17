import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuizFormComponent } from './quiz-form/quiz-form.component';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { PreviewComponent } from './preview/preview.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { InviteParticipantsComponent } from './invite-partcipants/invite-participants.component';
import { AuthenticationGuard } from '../authentication/services/authentication.guard';

const routes: Routes = [
    { path: 'edit',         canActivate: [AuthenticationGuard], component: QuizFormComponent },
    { path: 'edit/:id',     canActivate: [AuthenticationGuard], component: QuizFormComponent },
    { path: 'list',         canActivate: [AuthenticationGuard], component: QuizListComponent },
    { path: 'preview/:id',  canActivate: [AuthenticationGuard], component: PreviewComponent },
    { path: 'generate/:id', canActivate: [AuthenticationGuard], component: QuestionFormComponent },
    { path: 'invite',       canActivate: [AuthenticationGuard], component: InviteParticipantsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class QuizMakerRoutingModule { }
