import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import {
    ClearExecutionState, LoadExecutionSuccess, LoadInvitation, LoadInvitationError,
    LoadInvitationSuccess, PostAnswer, PostAnswerError, PostAnswerSuccess,
    PostExecutionError, PostExecutionSuccess, ResetError
} from '../actions/execution.actions';
import { Execution } from '../../../model/IExecution';
import { Invitation } from '../../../model/IInvitation';
import { Question, Quiz } from '../../../model/IQuiz';
import { Answer } from '../../../model/IAnswer';

/********** State **********/
export interface ExecutionState {
    currentInvitation: Invitation;
    currentExecution: Execution;
    currentQuiz: Quiz;
    answers: Answer[];
    postAnswersPending: number;
    loading: boolean;
    error: string;
}

export const initialExecutionState: ExecutionState = {
    currentInvitation: null,
    currentExecution: null,
    currentQuiz: null,
    answers: [],
    postAnswersPending: 0,
    loading: false,
    error: ''
};

/********** Selectors **********/
export const selectExecutionState = createFeatureSelector<ExecutionState>('execution');

export const isExecutionStateLoaded = createSelector(selectExecutionState, execution => !!execution);

export const getCurrentInvitation = (state: ExecutionState): Invitation => state.currentInvitation;
export const selectCurrentInvitation = createSelector(selectExecutionState, getCurrentInvitation);

export const getCurrentExecution = (state: ExecutionState): Execution => state.currentExecution;
export const selectCurrentExecution = createSelector(selectExecutionState, getCurrentExecution);

export const getCurrentQuiz = (state: ExecutionState): Quiz => state.currentQuiz;
export const selectCurrentQuiz = createSelector(selectExecutionState, getCurrentQuiz);

export const getQuestionsTab = (state: ExecutionState): Question[] =>
    [...state.currentQuiz.questions].sort((a, b) => a.position - b.position);
export const selectQuestionsTab = createSelector(selectExecutionState, getQuestionsTab);

export const getAnswers = (state: ExecutionState): Answer[] => state.answers;
export const selectAnswers = createSelector(selectExecutionState, getAnswers);

export const getPostAnswersPending = (state: ExecutionState): number => state.postAnswersPending;
export const selectPostAnswersPending = createSelector(selectExecutionState, getPostAnswersPending);

export const getLoading = (state: ExecutionState): boolean => state.loading;
export const selectLoading = createSelector(selectExecutionState, getLoading);

export const getError = (state: ExecutionState): string => state.error;
export const selectError = createSelector(selectExecutionState, getError);

/********** Reducer **********/
export const executionReducer = createReducer(
    initialExecutionState,
    on(LoadInvitation,
        state => ({
            ...state,
            loading: true
        })
    ),
    on(LoadInvitationSuccess,
        (state, {invitation}) => ({
            ...state,
            currentInvitation: invitation,
            currentQuiz: invitation.quiz as Quiz,
            loading: false
        })
    ),
    on(LoadExecutionSuccess,
        (state, {execution}) => ({
            ...state,
            currentExecution: execution
        })
    ),
    on(PostExecutionSuccess,
        (state, {execution}) => ({
            ...state,
            currentExecution: execution
        })
    ),
    on(PostAnswer,
        state => ({
            ...state,
            postAnswersPending: state.postAnswersPending + 1
        })
    ),
    on(PostAnswerSuccess,
        (state, {answer}) => ({
            ...state,
            answers: [...state.answers, answer],
            postAnswersPending: state.postAnswersPending - 1
        })
    ),
    on(PostAnswerError,
        (state, {err}) => ({
            ...state,
            postAnswersPending: state.postAnswersPending - 1,
            error: err
        })
    ),
    on(PostExecutionError, LoadInvitationError,
        (state, {err}) => ({
            ...state,
            error: err
        })
    ),
    on(ResetError,
        state => ({
            ...state,
            loading: false,
            error: ''
    })),
    on(ClearExecutionState,
        _ => initialExecutionState
    )
);
