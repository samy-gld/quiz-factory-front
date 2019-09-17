import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuizExecutionComponent } from './quiz-execution/quiz-execution.component';
import { QuizLauncherComponent } from './quiz-launcher/quiz-launcher.component';

const routes: Routes = [
    { path: 'invitation/:token', component: QuizExecutionComponent },
    { path: 'invitation', component: QuizExecutionComponent },
    { path: 'launcher', component: QuizLauncherComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class QuizExecutionRoutingModule { }
