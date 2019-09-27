import { createAction, props, union } from '@ngrx/store';
import { Proposition, Question, Quiz } from '../../../model/IQuiz';
import { Update } from '@ngrx/entity';

export const LoadQuiz = createAction(
    '[Quiz] Load a Quiz',
    props<{id: number}>()
);

export const LoadQuizSuccess = createAction(
    '[Quiz] Load a Quiz Success',
    props<{quiz: Quiz}>()
);

export const LoadQuizError = createAction(
    '[Quiz] Load a quiz Error',
    props<{error: string}>()
);

export const CreateQuestion = createAction(
    '[Question] Create a Question',
    props<{quizId: number, question: Question}>()
);

export const CreateQuestionSuccess = createAction(
    '[Question] Create a Question Success',
    props<{question: Question}>()
);

export const CreateQuestionError = createAction(
    '[Question] Create Question Error',
    props<{error: string}>()
);

export const UpdateQuestion = createAction(
    '[Question] Update a Question',
    props<{question: Question}>()
);

export const UpdateQuestionSuccess = createAction(
    '[Question] Update a Question Success',
    props<{question: Update<Question>}>()
);

export const UpdateQuestionError = createAction(
    '[Question] Update Question Error',
    props<{error: string}>()
);

export const DeleteQuestion = createAction(
    '[Question] Delete a Question',
    props<{id: number, questionPosition: number}>()
);

export const DeleteQuestionSuccess = createAction(
    '[Question] Delete a Question Success',
    props<{questionPosition: number}>()
);

export const DeleteQuestionError = createAction(
    '[Question] Delete Question Error',
    props<{error: string}>()
);

export const IncrementPosition = createAction(
    '[Question] Increment currentQuestionPosition'
);

export const DecrementPosition = createAction(
    '[Question] Decrement currentQuestionPosition'
);

export const GoToPosition = createAction(
    '[Question] Modify currentQuestionPosition',
    props<{position: number}>()
);

export const UpdateQuestionForm = createAction(
    '[QuestionForm] Update questionForm state',
    props<{question: Question}>()
);

export const ResetErrorSaving = createAction(
    '[Question save] Reset flag save error'
);

export const UnsetAll = createAction(
    '[Question] Unset all variables of the store'
);

const actions = union({
  LoadQuiz, LoadQuizSuccess, LoadQuizError,
  CreateQuestion, CreateQuestionSuccess, CreateQuestionError,
  UpdateQuestion, UpdateQuestionSuccess, UpdateQuestionError,
  DeleteQuestion, DeleteQuestionSuccess, DeleteQuestionError,
  IncrementPosition, DecrementPosition, GoToPosition, UpdateQuestionForm,
  ResetErrorSaving, UnsetAll
});

export type ActionsUnion = typeof actions;
