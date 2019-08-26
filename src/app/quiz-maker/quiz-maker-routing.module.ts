import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuizFormComponent } from './quiz-form/quiz-form.component';
import { QuizListComponent } from './quiz-list/quiz-list.component';
import { PreviewComponent } from './preview/preview.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { InviteParticipantsComponent } from './invite-partcipants/invite-participants.component';

const routes: Routes = [
    {
        path: 'edit',
        component: QuizFormComponent
    },
    {
        path: 'edit/:id',
        component: QuizFormComponent
    },
    {
        path: 'list',
        component: QuizListComponent
    },
    {
        path: 'preview/:id',
        component: PreviewComponent
    },
    {
        path: 'generate/:id',
        component: QuestionFormComponent
        // runGuardsAndResolvers: 'always'
    },
    {
        path: 'invite',
        component: InviteParticipantsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class QuizMakerRoutingModule { }
