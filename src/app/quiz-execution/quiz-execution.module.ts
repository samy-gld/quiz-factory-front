import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizExecutionComponent } from './quiz-execution/quiz-execution.component';
import { QuizExecutionRoutingModule } from './quiz-execution-routing.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { executionReducer } from './store/reducers/execution.reducer';
import { ExecutionEffects } from './store/effects/execution.effects';
import { QuizLauncherComponent } from './quiz-launcher/quiz-launcher.component';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { DisplayResultComponent } from './display-result/display-result.component';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
    declarations: [
        QuizExecutionComponent,
        QuizLauncherComponent,
        DisplayResultComponent
    ],
    imports: [
        CommonModule,
        ModalModule.forRoot(),
        QuizExecutionRoutingModule,
        ProgressbarModule.forRoot(),
        StoreModule.forFeature('execution', executionReducer),
        EffectsModule.forFeature([ExecutionEffects])
    ],
    exports: [
        QuizExecutionComponent,
        QuizLauncherComponent,
        DisplayResultComponent
    ],
    providers: [
        BsModalService
    ]
})
export class QuizExecutionModule { }
