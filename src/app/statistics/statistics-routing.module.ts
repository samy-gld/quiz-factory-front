import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatisticsComponent } from './statistics.component';
import { AuthenticationGuard } from '../authentication/services/authentication.guard';
import { FullStatsComponent } from './display/full-stats/full-stats.component';
import { ByQuizStatsComponent } from './display/by-quiz-stats/by-quiz-stats.component';
import { ByQuestionStatsComponent } from './display/by-question-stats/by-question-stats.component';

const routes: Routes = [
    {
        path: 'stats',
        canActivate: [AuthenticationGuard],
        component: StatisticsComponent,
        children: [
            {
                path: 'individual/:id',
                canActivate: [AuthenticationGuard],
                component: FullStatsComponent,
            },
            {
                path: 'byquiz/:id',
                canActivate: [AuthenticationGuard],
                component: ByQuizStatsComponent,
            },
            {
                path: 'byquestion/:id',
                canActivate: [AuthenticationGuard],
                component: ByQuestionStatsComponent,
            }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticsRoutingModule { }
