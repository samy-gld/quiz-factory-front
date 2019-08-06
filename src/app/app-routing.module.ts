import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {AuthenticationGuard} from './authentication/services/authentication.guard';

export const AppRoutes: Routes = [
    {
        path: 'quiz',
        canActivate: [AuthenticationGuard],
        loadChildren: () => import('./quiz-maker/quiz-maker.module').then(
            mod => mod.QuizMakerModule
        )
    },
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
