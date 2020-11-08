import { Injectable } from '@angular/core';
import { LoadQuiz, LoadQuizInvitations, UnsetAllStats } from '../store/actions/statistics.actions';
import { select, Store } from '@ngrx/store';
import {
    selectCurrentQuiz,
    selectExecutedInvitations,
    selectLoadingInvitations,
    selectLoadingQuizzes,
    StatisticsState
} from '../store/reducers/statistics.reducer';
import { filter, map, skipWhile, take, withLatestFrom } from 'rxjs/operators';
import { Proposition, Question, Quiz } from '../../model/IQuiz';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { Invitation } from '../../model/IInvitation';

@Injectable({
    providedIn: 'root'
})
export class StatisticsService {

    quizId: number;
    quiz$: Observable<Quiz> = of(null);
    quizInvitation$: Observable<[Quiz, Invitation[]]>;
    loadingStatsSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);
    statsReadySubject: Subject<boolean> = new BehaviorSubject<boolean>(false);

    /* Full Stats */
    invitations$: Observable<Invitation[]> = of(null);
    questions$: Observable<Question[]> = of(null);
    answersTab: any[][];
    answerTabSubject: Subject<any[][]> = new BehaviorSubject<any[][]>([]);

    /* Stats by quiz */
    successRateByQuiz$: Observable<any[]>;

    /* Stats by question */
    successRateByQuestion$: Observable<any[]>;

    constructor(private statisticsStore: Store<StatisticsState>) { }

    generateStats(quizId: number) {
        this.quizId = Number(quizId);
        this.unsetAll();

        if (!isNaN(this.quizId)) {
            this.emitLoadingStatsSubject(true);

            this.statisticsStore.dispatch(LoadQuizInvitations({quizId}));
            this.statisticsStore.dispatch(LoadQuiz({id: quizId}));

            this.invitations$ = this.statisticsStore.pipe(
                select(selectExecutedInvitations),
                withLatestFrom(
                    this.statisticsStore.select(selectLoadingInvitations).pipe(
                        skipWhile(loading => !!loading)
                    )
                ),
                // skipWhile(i => i.length === 0),
                take(1),
                map(([invitation]) => invitation)
            );

            this.quiz$ = this.statisticsStore.pipe(
                select(selectCurrentQuiz),
                filter(q => !!q),
                take(1)
            );

            this.quizInvitation$ = this.quiz$.pipe(
                withLatestFrom(
                    this.invitations$
                ),
                // shareReplay({refCount: true, bufferSize: 1})
            );

            this.generateFullStats();
            this.generateStatsByQuiz();
            this.generateStatsByQuestion();

            this.quizInvitation$.subscribe(
                _ => {
                    this.emitStatsReadySubject(true);
                    this.emitLoadingStatsSubject(false);
                }
            );
        } else {
            this.emitLoadingStatsSubject(false);
        }
    }

    generateFullStats() {
        this.quizInvitation$.subscribe(
            ([quiz, invitations]) => {
                const nbQuestions = quiz.questions.length;
                this.answersTab = Array(invitations.length).fill('-');
                invitations.forEach(
                    (invitation, i) => {
                        this.answersTab[i] = Array(nbQuestions).fill('-');
                        if (invitation.execution !== undefined && invitation.execution.answers !== undefined) {
                            invitation.execution.answers.forEach(
                                (answer, j) => {
                                    let displayProps = `<ul class="list-group">`;
                                    [...answer.propositions].forEach(value => {
                                      displayProps += `<li class="list-group-item">` +
                                        (value as unknown as Proposition).label +
                                        `</li>`;
                                    });
                                    displayProps += `</ul>`;
                                    this.answersTab[i][j] = displayProps;
                                }
                            );
                        }
                    });

                this.emitAnswerTabSubject(this.answersTab);
            }
        );

        this.questions$ = this.quiz$.pipe(
            map(
                currentQuiz => [...currentQuiz.questions].sort((a, b) => a.position - b.position)
            )
        );
    }

    generateStatsByQuiz() {
        this.successRateByQuiz$ = this.quizInvitation$.pipe(
            map(
                ([quiz, invitations]) => {
                    if (invitations.length === 0) {
                        return null;
                    } else {
                        const nbQuestions = quiz.questions.length;
                        let result25 = 0;
                        let result50 = 0;
                        let result75 = 0;
                        let result100 = 0;

                        invitations.forEach(
                            invitation => {
                                let invitationScore = 0;
                                if (invitation.execution !== undefined) {
                                    invitation.execution.answers.forEach(
                                      answer => {
                                        if (answer.success) {
                                          invitationScore++;
                                        }
                                      }
                                    );

                                    const result = invitationScore / nbQuestions;
                                    switch (true) {
                                        case result < 0.25:
                                            result25++;
                                            break;
                                        case result >= 0.25 && result < 0.5:
                                            result50++;
                                            break;
                                        case result >= 0.5 && result < 0.75:
                                            result75++;
                                            break;
                                        case result >= 0.75:
                                            result100++;
                                            break;
                                    }
                                }
                            }
                        );

                        return [
                            {
                                name: '< 25%',
                                value: result25 * 100
                            },
                            {
                                name: 'entre 25% et 50%',
                                value: result50 * 100
                            },
                            {
                                name: 'entre 50% et 75%',
                                value: result75 * 100
                            },
                            {
                                name: '> 75%',
                                value: result100 * 100
                            }
                        ];
                    }
                }
            )
        );
    }

    generateStatsByQuestion() {
        this.successRateByQuestion$ = this.quizInvitation$.pipe(
            map(
                ([quiz, invitations]) => {
                    if (invitations.length === 0) {
                        return null;
                    } else {
                        const results = [];
                        const questions = [...quiz.questions];
                        questions.forEach(
                            (question, i) => {
                                let successQuestionCount = 0;
                                let nbExecutions = 0;
                                invitations.forEach(
                                    invitation => {
                                        if (invitation.execution !== undefined) {
                                            nbExecutions++;
                                            const indexPosition = invitation.execution.answers.findIndex(
                                                answer => answer.questionPosition === question.position
                                            );
                                            if (indexPosition >= 0 && invitation.execution.answers[indexPosition].success) {
                                                successQuestionCount++;
                                            }
                                        }
                                    }
                                );
                                results.push({
                                    name: 'Quest.' + (i + 1),
                                    value: successQuestionCount / nbExecutions * 100
                                });
                            }
                        );

                        return results;
                    }
                }
            )
        );
    }

    emitLoadingStatsSubject(selected: boolean) {
        this.loadingStatsSubject.next(selected);
    }

    getLoadingStats(): Observable<boolean> {
        return this.loadingStatsSubject.asObservable();
    }

    emitStatsReadySubject(ready: boolean) {
        this.statsReadySubject.next(ready);
    }

    getStatsReady(): Observable<boolean> {
        return this.statsReadySubject.asObservable();
    }

    emitAnswerTabSubject(data: any[][]) {
        this.answerTabSubject.next(data);
    }

    getAnswerTab(): Observable<any[][]> {
        return this.answerTabSubject.asObservable();
    }

    private unsetAll() {
        this.emitStatsReadySubject(false);
        this.statisticsStore.dispatch(UnsetAllStats());
        this.emitAnswerTabSubject([]);
        this.invitations$ = of(null);
        this.questions$ = of(null);
    }
}
