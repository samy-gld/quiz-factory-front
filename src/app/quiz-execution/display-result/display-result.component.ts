import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {ExecutionState, selectAnswers, selectPostAnswersPending} from '../store/reducers/execution.reducer';
import {first, map, skipWhile, tap, withLatestFrom} from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-display-result',
    templateUrl: './display-result.component.html',
    styleUrls: ['./display-result.component.css']
})
export class DisplayResultComponent implements OnInit {

    results$: Observable<any>;

    constructor(private executionStore: Store<ExecutionState>) { }

    ngOnInit() {
        this.results$ = this.executionStore.select(selectPostAnswersPending).pipe(
            skipWhile(pending => pending !== 0),
            withLatestFrom(
                this.executionStore.select(selectAnswers).pipe(first())
            ),
            map(([_, answers]) => {
                    const count = answers.length;
                    const result = answers.filter(answer => !!answer.success).length;
                    return {
                        count,
                        result,
                        average: result / count
                    };
                }
            ),
        );
    }
}
