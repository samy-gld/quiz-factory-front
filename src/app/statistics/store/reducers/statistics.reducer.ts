import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import {
    ClearStatisticsState, LoadQuestionsSuccess, LoadQuizInvitationsSuccess,
    LoadQuizzes, LoadQuizzesError, LoadQuizzesSuccess, UnsetAllStats
} from '../actions/statistics.actions';
import { Question, Quiz } from '../../../model/IQuiz';
import { Invitation } from '../../../model/IInvitation';

/********** State **********/
export interface StatisticsState {
    quizzes: Quiz[];
    invitations: Invitation[];
    questions: Question[];
    loadingQuizzes: boolean;
}

export const initialStatisticsState: StatisticsState = {
    quizzes: [],
    invitations: [],
    questions: [],
    loadingQuizzes: false
};

/********** Selectors **********/
export const selectStatisticsState = createFeatureSelector<StatisticsState>('statistics');

export const isStatisticsStateLoaded = createSelector(selectStatisticsState, statistics => !!statistics);

export const getFinalizedQuizzes = (state: StatisticsState): Quiz[] => [...state.quizzes].filter(q => q.status === 'finalized');
export const selectFinalizedQuizzes = createSelector(selectStatisticsState, getFinalizedQuizzes);

export const getExecutedInvitations = (state: StatisticsState): Invitation[] => [...state.invitations].filter(i => i.execution !== null);
export const selectExecutedInvitations = createSelector(selectStatisticsState, getExecutedInvitations);

export const getQuestions = (state: StatisticsState): Question[] => [...state.questions].sort((a, b) => a.position - b.position);
export const selectQuestions = createSelector(selectStatisticsState, getQuestions);

export const getLoadingQuizzes = (state: StatisticsState): boolean => state.loadingQuizzes;
export const selectLoadingQuizzes = createSelector(selectStatisticsState, getLoadingQuizzes);

/********** Reducer **********/
export const statisticsReducer = createReducer(
    initialStatisticsState,
    on(LoadQuizzes,
        state => ({
            ...state,
            loadingQuizzes: true
        })
    ),
    on(LoadQuizzesSuccess,
        (state, {quizzes}) => ({
            ...state,
            quizzes,
            loadingQuizzes: false
        })
    ),
    on(LoadQuizzesError,
        state => ({
            ...state,
            loadingQuizzes: false
    })),
    on(LoadQuizInvitationsSuccess,
        (state, {invitations}) => ({
            ...state,
            invitations
        })
    ),
    on(LoadQuestionsSuccess,
        (state, {questions}) => ({
            ...state,
            questions
        })
    ),
    on(UnsetAllStats,
        state => ({
            ...state,
            invitations: [],
            questions: []
        })
    ),
    on(ClearStatisticsState,
        _ => initialStatisticsState
    )
);
