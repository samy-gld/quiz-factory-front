import { createAction, props, union } from '@ngrx/store';
import { Question, Quiz } from '../../../model/IQuiz';
import { Invitation } from '../../../model/IInvitation';

export const LoadQuizzes = createAction(
    '[Stats] Load Quizzes',
);

export const LoadQuizzesSuccess = createAction(
    '[Stats] Load Quizzes Success',
    props<{quizzes: Quiz[]}>()
);

export const LoadQuizzesError = createAction(
    '[Stats] Load Quizzes Error',
    props<{error: string}>()
);

export const LoadQuiz = createAction(
    '[Stats] Load a Quiz',
    props<{id: number}>()
);

export const LoadQuizSuccess = createAction(
    '[Stats] Load a Quiz Success',
    props<{quiz: Quiz}>()
);

export const LoadQuizError = createAction(
    '[Stats] Load a Quiz Error',
    props<{error: string}>()
);

export const LoadQuizInvitations = createAction(
    '[Stats] Load Invitations/Executions for a Quiz',
    props<{quizId: number}>()
);

export const LoadQuizInvitationsSuccess = createAction(
    '[Stats] Load Invitations/Executions for a Quiz Success',
    props<{invitations: Invitation[]}>()
);

export const LoadQuizInvitationsError = createAction(
    '[Stats] Load Invitations/Executions for a Quiz Error',
    props<{error: string}>()
);

export const LoadQuestions = createAction(
    '[Stats] Load Questions',
    props<{quizId: number}>()
);

export const LoadQuestionsSuccess = createAction(
    '[Stats] Load Questions Success',
    props<{questions: Question[]}>()
);

export const LoadQuestionsError = createAction(
    '[Stats] Load Questions Error',
    props<{error: string}>()
);

export const UnsetAllStats = createAction(
    '[Stats] Unset All Stats Properties'
);

export const ClearStatisticsState = createAction(
    '[Logout] Clear State'
);

const actions = union({
    LoadQuizzes, LoadQuizzesSuccess, LoadQuizzesError,
    LoadQuiz, LoadQuizSuccess, LoadQuizError,
    LoadQuestions, LoadQuestionsSuccess, LoadQuestionsError,
    UnsetAllStats, ClearStatisticsState
});

export type ActionsUnion = typeof actions;
