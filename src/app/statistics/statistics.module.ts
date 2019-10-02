import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { StatisticsComponent } from './statistics.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { statisticsReducer } from './store/reducers/statistics.reducer';
import { StatisticsEffects } from './store/effects/statistics.effects';
import { DisplayStatsComponent } from './display-stats/display-stats.component';
import { PopoverModule } from 'ngx-bootstrap/popover';

@NgModule({
    declarations: [
        StatisticsComponent,
        DisplayStatsComponent
    ],
    imports: [
        CommonModule,
        StatisticsRoutingModule,
        StoreModule.forFeature('statistics', statisticsReducer),
        EffectsModule.forFeature([StatisticsEffects]),
        PopoverModule.forRoot()
    ]
})
export class StatisticsModule { }
