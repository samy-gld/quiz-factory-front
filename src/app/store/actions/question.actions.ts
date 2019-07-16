import { createAction, props, union } from '@ngrx/store';
import {Proposition, Question} from '../../model/IQuiz';
import {Update} from '@ngrx/entity';

export const LoadQuestions = createAction(
    '[Question] Load Questions',
    props<{id: number}>()
);

export const LoadQuestionsSuccess = createAction(
    '[Question] Load Questions Success',
    props<{questions: Question[]}>()
);

export const CreateQuestion = createAction(
    '[Question] Create a Question',
    props<{quizId: number, question: Question}>()
);

export const CreateQuestionSuccess = createAction(
    '[Question] Create a Question Success',
    props<{question: Question}>()
);

export const UpdateQuestion = createAction(
    '[Question] Update a Question',
    props<{question: Question}>()
);

export const UpdateQuestionSuccess = createAction(
    '[Question] Update a Question Success',
    props<{question: Update<Question>}>()
);

export const CreateProposition = createAction(
    '[Question] Create a Proposition',
    props<{questionId: number, questionPosition: number, proposition: Proposition}>()
);

export const CreatePropositionSuccess = createAction(
    '[Question] Create a Proposition Success',
    props<{questionPosition: number, proposition: Proposition}>()
);

export const CreatePropositionCancelled = createAction(
    '[Question] Create a Proposition Cancelled'
);

export const UpdateProposition = createAction(
    '[Question] Update a Proposition',
    props<{questionPosition: number, id: number, proposition: Proposition, index: number}>()
);

export const UpdatePropositionSuccess = createAction(
    '[Question] Update a Proposition Success',
    props<{questionPosition: number, id: number, proposition: Proposition, index: number}>()
);

export const UpdatePropositionCancelled = createAction(
    '[Question] Update a Proposition Cancelled'
);

export const DeleteProposition = createAction(
    '[Question] Delete a Proposition',
    props<{questionPosition: number, propositionId: number}>()
);

export const DeletePropositionSuccess = createAction(
    '[Question] Delete a Proposition Success',
    props<{questionPosition: number, propositionId: number}>()
);

export const DeletePropositionCancelled = createAction(
    '[Question] Delete a Proposition Cancelled'
);

export const IncrementPosition = createAction(
    '[Question] Increment currentQuestionPosition'
);

export const DecrementPosition = createAction(
    '[Question] Decrement currentQuestionPosition'
);

export const UnsetAll = createAction(
    '[Question] Unset all variable of the store'
)

const actions = union({
  LoadQuestions, LoadQuestionsSuccess,
  CreateQuestion, CreateQuestionSuccess,
  UpdateQuestion, UpdateQuestionSuccess,
  CreateProposition, CreatePropositionSuccess, CreatePropositionCancelled,
  UpdateProposition, UpdatePropositionSuccess, UpdatePropositionCancelled,
  DeleteProposition, DeletePropositionSuccess, DeletePropositionCancelled,
  IncrementPosition, DecrementPosition, UnsetAll
});

export type ActionsUnion = typeof actions;
