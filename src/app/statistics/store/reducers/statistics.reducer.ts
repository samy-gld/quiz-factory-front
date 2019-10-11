import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import {
    ClearStatisticsState, LoadQuestionsSuccess, LoadQuizInvitations, LoadQuizInvitationsError, LoadQuizInvitationsSuccess, LoadQuizSuccess,
    LoadQuizzes, LoadQuizzesError, LoadQuizzesSuccess, UnsetAllStats
} from '../actions/statistics.actions';
import { Question, Quiz } from '../../../model/IQuiz';
import { Invitation } from '../../../model/IInvitation';

/********** State **********/
export interface StatisticsState {
    quizzes: Quiz[];
    invitations: Invitation[];
    questions: Question[];
    currentQuiz: Quiz;
    loadingQuizzes: boolean;
    loadingInvitations: boolean;
}

export const initialStatisticsState: StatisticsState = {
    quizzes: [],
    invitations: [],
    questions: [],
    currentQuiz: null,
    loadingQuizzes: false,
    loadingInvitations: false
};

/********** Selectors **********/
export const selectStatisticsState = createFeatureSelector<StatisticsState>('statistics');

export const isStatisticsStateLoaded = createSelector(selectStatisticsState, statistics => !!statistics);

export const getFinalizedQuizzes = (state: StatisticsState): Quiz[] => [...state.quizzes].filter(q => q.status === 'finalized');
export const selectFinalizedQuizzes = createSelector(selectStatisticsState, getFinalizedQuizzes);

export const getExecutedInvitations = (state: StatisticsState): Invitation[] => [...state.invitations].filter(i => i.execution !== null);
export const selectExecutedInvitations = createSelector(selectStatisticsState, getExecutedInvitations);

export const getLoadingQuizzes = (state: StatisticsState): boolean => state.loadingQuizzes;
export const selectLoadingQuizzes = createSelector(selectStatisticsState, getLoadingQuizzes);

export const getLoadingInvitations = (state: StatisticsState): boolean => state.loadingInvitations;
export const selectLoadingInvitations = createSelector(selectStatisticsState, getLoadingInvitations);

export const getCurrentQuiz = (state: StatisticsState): Quiz => state.currentQuiz;
export const selectCurrentQuiz = createSelector(selectStatisticsState, getCurrentQuiz);

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
    on(LoadQuizInvitations,
        state => ({
            ...state,
            loadingInvitations: true
        })
    ),
    on(LoadQuizInvitationsSuccess,
        (state, {invitations}) => ({
            ...state,
            invitations,
            loadingInvitations: false
        })
    ),
    on(LoadQuizInvitationsError,
        state => ({
            ...state,
            loadingQuizzes: false
        })
    ),
    on(LoadQuestionsSuccess,
        (state, {questions}) => ({
            ...state,
            questions
        })
    ),
    on(LoadQuizSuccess,
        (state, {quiz}) => ({
            ...state,
            currentQuiz: quiz
        })
    ),
    on(UnsetAllStats,
        state => ({
            ...state,
            invitations: [],
            questions: [],
            currentQuiz: null
        })
    ),
    on(ClearStatisticsState,
        _ => initialStatisticsState
    )
);
