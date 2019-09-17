import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationGuard } from './authentication/services/authentication.guard';

export const AppRoutes: Routes = [
    {
        path: 'quiz',
        canActivate: [AuthenticationGuard],
        loadChildren: () => import('./quiz-maker/quiz-maker.module').then(
            m => m.QuizMakerModule
        )
    },
    {
        path: 'execute',
        loadChildren: () => import('./quiz-execution/quiz-execution.module').then(
            m => m.QuizExecutionModule
        )
    },
    {
        path: 'stats',
        canActivate: [AuthenticationGuard],
        loadChildren: () => import('./statistics/statistics.module').then(
            m => m.StatisticsModule) },
    {
        path: '',
        redirectTo: '/',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/'
    }
];

@NgModule({
    exports: [
        RouterModule
    ],
    imports: [
        HttpClientModule,
        RouterModule.forRoot(AppRoutes)
    ]
})

export class AppRoutingModule {}
