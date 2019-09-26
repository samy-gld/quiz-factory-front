import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import {
    LoadQuestionsSuccess,
    LoadQuizInvitationsSuccess,
    LoadQuizzesSuccess, UnsetAllStats
} from '../actions/statistics.actions';
import { Question, Quiz } from '../../../model/IQuiz';
import { Invitation } from '../../../model/IInvitation';

/********** State **********/
export interface StatisticsState {
    quizzes: Quiz[];
    invitations: Invitation[];
    questions: Question[];
}

export const initialStatisticsState: StatisticsState = {
    quizzes: [],
    invitations: [],
    questions: []
};

/********** Selectors **********/
export const selectStatisticsState = createFeatureSelector<StatisticsState>('statistics');

export const getFinalizedQuizzes = (state: StatisticsState): Quiz[] => [...state.quizzes].filter(q => q.status === 'finalized');
export const selectFinalizedQuizzes = createSelector(selectStatisticsState, getFinalizedQuizzes);

export const getExecutedInvitations = (state: StatisticsState): Invitation[] => [...state.invitations].filter(i => i.execution !== null);
export const selectExecutedInvitations = createSelector(selectStatisticsState, getExecutedInvitations);

export const getQuestions = (state: StatisticsState): Question[] => [...state.questions].sort((a, b) => a.position - b.position);
export const selectQuestions = createSelector(selectStatisticsState, getQuestions);

export const getCurrentQuiz = (quizId: number) => (state: StatisticsState): Quiz =>
    [...state.quizzes].filter(quiz => quiz.id === quizId)[0];
export const selectCurrentQuiz = (quizId: number) =>
    createSelector(selectStatisticsState, getCurrentQuiz(quizId));

/********** Reducer **********/
export const statisticsReducer = createReducer(
    initialStatisticsState,
    on(LoadQuizzesSuccess,
        (state, {quizzes}) => ({
            ...state,
            quizzes
        })
    ),
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
    }))
);
