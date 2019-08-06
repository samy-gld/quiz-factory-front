import { createAction, props, union } from '@ngrx/store';
import {Proposition, Question, Quiz} from '../../model/IQuiz';
import {Update} from '@ngrx/entity';

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
    props<{error: any}>()
);

export const LoadQuestions = createAction(
    '[Question] Load Questions',
    props<{id: number}>()
);

export const LoadQuestionsSuccess = createAction(
    '[Question] Load Questions Success',
    props<{questions: Question[]}>()
);

export const LoadQuestionError = createAction(
    '[Question] Load Questions Error',
    props<{error: any}>()
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
    props<{error: any}>()
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
    props<{error: any}>()
);

export const CreateProposition = createAction(
    '[Question] Create a Proposition',
    props<{questionId: number, questionPosition: number, proposition: Proposition, index: number}>()
);

export const CreatePropositionSuccess = createAction(
    '[Question] Create a Proposition Success',
    props<{questionPosition: number, proposition: Proposition, index: number}>()
);

export const CreatePropositionError = createAction(
    '[Question] Create a Proposition Error',
    props<{error: any}>()
);

export const UpdateProposition = createAction(
    '[Question] Update a Proposition',
    props<{questionPosition: number, id: number, proposition: Proposition, index: number}>()
);

export const UpdatePropositionSuccess = createAction(
    '[Question] Update a Proposition Success',
    props<{questionPosition: number, id: number, proposition: Proposition, index: number}>()
);

export const UpdatePropositionError = createAction(
    '[Question] Update a Proposition Error',
    props<{error: any}>()
);

export const DeleteProposition = createAction(
    '[Question] Delete a Proposition',
    props<{questionPosition: number, propositionId: number}>()
);

export const DeletePropositionSuccess = createAction(
    '[Question] Delete a Proposition Success',
    props<{questionPosition: number, propositionId: number}>()
);

export const DeletePropositionError = createAction(
    '[Question] Delete a Proposition Error',
    props<{error: any}>()
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
  LoadQuestions, LoadQuestionsSuccess, LoadQuestionError,
  CreateQuestion, CreateQuestionSuccess, CreateQuestionError,
  UpdateQuestion, UpdateQuestionSuccess, UpdateQuestionError,
  CreateProposition, CreatePropositionSuccess, CreatePropositionError,
  UpdateProposition, UpdatePropositionSuccess, UpdatePropositionError,
  DeleteProposition, DeletePropositionSuccess, DeletePropositionError,
  IncrementPosition, DecrementPosition, GoToPosition, UpdateQuestionForm,
  ResetErrorSaving, UnsetAll
});

export type ActionsUnion = typeof actions;
