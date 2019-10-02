import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ExecutionState, selectAnswers, selectPostAnswersPending } from '../store/reducers/execution.reducer';
import { map, skipWhile, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-display-result',
    templateUrl: './display-result.component.html',
    styleUrls: ['./display-result.component.css']
})
export class DisplayResultComponent implements OnInit {

    @Output() closeModal: EventEmitter<boolean> = new EventEmitter<boolean>();
    results$: Observable<any>;

    constructor(private executionStore: Store<ExecutionState>) { }

    ngOnInit() {
        this.executionStore.pipe(
            select(selectPostAnswersPending),
            skipWhile(pending => pending !== 0),
            take(1)
        ).subscribe(
            _ => this.results$ = this.executionStore.pipe(
                            select(selectAnswers),
                            map(answers => {
                                    const count = answers.length;
                                    const result = answers.filter(answer => !!answer.success).length;
                                    return {
                                        count,
                                        result,
                                        average: result / count
                                    };
                                }
                            )
                        )
        );
    }

    onClose() {
        this.closeModal.emit(true);
    }
}
