import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatisticsComponent } from './statistics.component';
import { AuthenticationGuard } from '../authentication/services/authentication.guard';

const routes: Routes = [
    { path: 'stats', canActivate: [AuthenticationGuard], component: StatisticsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticsRoutingModule { }
