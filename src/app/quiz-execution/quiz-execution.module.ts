import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizExecutionComponent } from './quiz-execution/quiz-execution.component';
import { QuizExecutionRoutingModule } from './quiz-execution-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { executionReducer } from './store/reducers/execution.reducer';
import { ExecutionEffects } from './store/effects/execution.effects';
import { QuizLauncherComponent } from './quiz-launcher/quiz-launcher.component';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { DisplayResultComponent } from './display-result/display-result.component';

@NgModule({
    declarations: [
        QuizExecutionComponent,
        QuizLauncherComponent,
        DisplayResultComponent
    ],
    imports: [
        CommonModule,
        QuizExecutionRoutingModule,
        ReactiveFormsModule,
        ProgressbarModule.forRoot(),
        StoreModule.forFeature('execution', executionReducer),
        EffectsModule.forFeature([ExecutionEffects])
    ],
    exports: [
        QuizExecutionComponent,
        QuizLauncherComponent,
        DisplayResultComponent
    ]
})
export class QuizExecutionModule { }
