import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { StatisticsComponent } from './statistics.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { statisticsReducer } from './store/reducers/statistics.reducer';
import { StatisticsEffects } from './store/effects/statistics.effects';
import { FullStatsComponent } from './display/full-stats/full-stats.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ByQuizStatsComponent } from './display/by-quiz-stats/by-quiz-stats.component';
import { ByQuestionStatsComponent } from './display/by-question-stats/by-question-stats.component';
import { StatisticsService } from './services/statistics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
    declarations: [
        StatisticsComponent,
        FullStatsComponent,
        ByQuizStatsComponent,
        ByQuestionStatsComponent
    ],
    imports: [
        CommonModule,
        StatisticsRoutingModule,
        PopoverModule.forRoot(),
        TabsModule.forRoot(),
        StoreModule.forFeature('statistics', statisticsReducer),
        EffectsModule.forFeature([StatisticsEffects]),
        NgxChartsModule
    ],
    providers: [
        StatisticsService
    ]
})
export class StatisticsModule { }
