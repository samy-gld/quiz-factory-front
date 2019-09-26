import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Proposition, Question } from '../../model/IQuiz';
import { Observable, of } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectExecutedInvitations, selectQuestions, StatisticsState } from '../store/reducers/statistics.reducer';
import {LoadQuestions, LoadQuizInvitations, UnsetAllStats} from '../store/actions/statistics.actions';
import { Invitation } from '../../model/IInvitation';
import { skipWhile, tap } from 'rxjs/operators';

@Component({
    selector: 'app-display-stats',
    templateUrl: './display-stats.component.html',
    styleUrls: ['./display-stats.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayStatsComponent implements OnInit, OnChanges {

    @Input()
    quizId: number;
    questions$: Observable<Question[]>;
    invitations$: Observable<Invitation[]>;
    propositions: any[];
    answersTab: any[];
    selected: boolean;
    loading: boolean;

    constructor(private statisticsStore: Store<StatisticsState>) { }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges): void {
        this.statisticsStore.dispatch(UnsetAllStats());
        this.invitations$ = of(null);
        this.questions$ = of(null);

        if (!isNaN(this.quizId)) {
            this.selected = true;
            this.statisticsStore.dispatch(LoadQuizInvitations({quizId: this.quizId}));
            this.statisticsStore.dispatch(LoadQuestions({quizId: this.quizId}));

            this.invitations$ = this.statisticsStore.pipe(
                select(selectExecutedInvitations),
                skipWhile(i => i.length === 0),
                tap(
                    invitations => {
                        this.answersTab = [[], []];
                        invitations.forEach((invitation, i) => {
                            invitation.execution.answers.forEach(
                                answer => {
                                    let displayProps = `<ul class="list-group">`;
                                    [...answer.propositions].forEach(value => {
                                        displayProps += `<li class="list-group-item">` + (value as unknown as Proposition).label + `</li>`;
                                    });
                                    displayProps += `</ul>`;
                                    this.answersTab[i].push(displayProps);
                                }
                            );
                        });
                    }
                )
            );
            this.questions$ = this.statisticsStore.pipe(
                select(selectQuestions),
                skipWhile(q => q.length === 0),
                tap(questions => {
                    this.propositions = [];
                    [...questions]
                        .forEach(q =>
                            [...q.propositions].forEach(p =>
                                this.propositions.push(
                                    {
                                        id: p.id,
                                        label: p.label
                                    }
                                )
                            )
                        );
                })
            );
        } else {
            this.selected = false;
        }
    }
}
