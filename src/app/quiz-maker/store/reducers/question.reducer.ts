import {Proposition, Question, Quiz} from '../../../model/IQuiz';
import {
    LoadQuizSuccess, GoToPosition, LoadQuiz, LoadQuizError, CreateQuestionSuccess, CreateQuestionError,
    UpdateQuestionSuccess, UpdateQuestionError, CreatePropositionError, CreatePropositionSuccess,
    UpdatePropositionSuccess, UpdatePropositionError, DeletePropositionSuccess, DeletePropositionError,
    UpdateQuestionForm, UnsetAll, IncrementPosition, DecrementPosition, ResetErrorSaving,
    DeleteQuestionSuccess, CreateQuestion, UpdateQuestion, DeleteQuestion
} from '../actions/question.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';

/********** State **********/
export interface QuestionState  extends EntityState<Question> {
    currentQuiz: Quiz | null;
    currentQuestion: Question | null;
    currentQuestionPosition: number | null;
    questionForm: Question[];
    savePendingQuestions: any[];
    loading: boolean;
    errorSaving: boolean;
}

export const questionAdapter: EntityAdapter<Question> = createEntityAdapter<Question>({
    sortComparer: sortQuestionByPosition,
    selectId: question => question.position
});

function sortQuestionByPosition(q1: Question, q2: Question) {
    return q1.position - q2.position;
}

export const initialQuestionState: QuestionState = questionAdapter.getInitialState({
    currentQuiz: null,
    currentQuestion: null,
    currentQuestionPosition: null,
    questionForm: [],
    savePendingQuestions: [],
    loading: false,
    errorSaving: false
});

/********** Selectors **********/
export const selectQuestionState = createFeatureSelector<QuestionState>('questions');

export const selectAllQuestions = createSelector(
    selectQuestionState,
    (state: QuestionState) => {
        const allQuestions = Object.values(state.entities);
        allQuestions.sort(sortQuestionByPosition);
    }
);

export const {
    selectIds: selectQuestionIds,
    selectEntities: selectQuestionEntities,
    selectAll: selectQuestions,
    selectTotal: countQuestions
} = questionAdapter.getSelectors(selectQuestionState);

export const getCurrentQuiz = (state: QuestionState): Quiz => state.currentQuiz;
export const selectCurrentQuiz = createSelector(selectQuestionState, getCurrentQuiz);

export const getCurrentQuizStatus = (state: QuestionState): boolean => state.currentQuiz.status === 'finalized';
export const selectCurrentQuizStatus = createSelector(selectQuestionState, getCurrentQuizStatus);

export const getCurrentQuestion = (state: QuestionState): Question => state.currentQuestion;
export const selectCurrentQuestion = createSelector(selectQuestionState, getCurrentQuestion);

export const getCurrentQuestionPosition = (state: QuestionState): number => state.currentQuestionPosition;
export const selectCurrentQuestionPosition = createSelector(selectQuestionState, getCurrentQuestionPosition);

export const getQuestionForm = (state: QuestionState): Question[] => state.questionForm;
export const selectQuestionForm = createSelector(selectQuestionState, getQuestionForm);

export const getLoading = (state: QuestionState): boolean => state.loading;
export const selectLoading = createSelector(selectQuestionState, getLoading);

export const getQuestionByPosition = (position: number) =>
    (entities): Question => entities[position] ? entities[position] : null;
export const selectQuestionByPosition = (position) =>
    createSelector(selectQuestionEntities, getQuestionByPosition(position));

export const getErrorSaving = (state: QuestionState): boolean => state.errorSaving;
export const selectErrorSaving = createSelector(selectQuestionState, getErrorSaving);

export const getSavePendingQuestions = (state: QuestionState): any[] => state.savePendingQuestions;
export const selectSavePendingQuestions = createSelector(selectQuestionState, getSavePendingQuestions);

export const selectQuestionsFromState = selectQuestionEntities;
export const selectIdsFromState = selectQuestionIds;
export const selectCountQuestions = countQuestions;

/********** Reducer **********/
export const questionReducer = createReducer(
    initialQuestionState,
    on(LoadQuiz,
        state => ({
            ...state,
            loading: true
        })
    ),
    on(LoadQuizSuccess,
        (state, {quiz}) => {
            const questions: Question[] = [...quiz.questions].map(question => {
                const props = [...question.propositions].sort((a, b) => a.position - b.position);
                const q = Object.assign({}, question);
                q.propositions = props;
                return q;
            });
            const currentQuiz: Quiz = Object.assign({}, quiz);
            Reflect.deleteProperty(currentQuiz, 'questions');
            return questionAdapter.addMany(questions, {
                ...state,
                currentQuiz,
                currentQuestion: questions.length !== 0 ? questions[0].position === 1 ? questions[0] : null : null,
                currentQuestionPosition: 1,
                questionForm: questions,
                loading: false
            });
        }
    ),
    on(LoadQuizError,
        state => ({
            ...state,
            loading: false
        })
    ),
    on(UpdateQuestion, CreateQuestion,
        (state, action) => ({
            ...state,
            savePendingQuestions: [...state.savePendingQuestions, {action: 'saving', position: action.question.position}]
        })
    ),
    on(DeleteQuestion,
        (state, action) => ({
            ...state,
            savePendingQuestions: [...state.savePendingQuestions, {action: 'deleting', position: action.questionPosition}]
        })
    ),
    on(CreateQuestionSuccess,
        (state, {question}) => {
            const qForm: Question[] = [...state.questionForm];
            const index = qForm.findIndex((q => q.position === question.position));
            if (index >= 0) {
                const createdQuestion = Object.assign({}, qForm[index]);
                createdQuestion.id = question.id;
                qForm[index] = createdQuestion;
            }
            return questionAdapter.addOne(question, {
                ...state,
                questionForm: qForm,
                currentQuestion: question.position === state.currentQuestionPosition ? question : state.currentQuestion,
                savePendingQuestions: state.savePendingQuestions.slice(0).filter(p => p.position !== question.position)
            });
        }
    ),
    on(UpdateQuestionSuccess,
        (state, {question}) => {
            const qForm: Question[] = [...state.questionForm];
            const index = qForm.findIndex((q => q.position === question.id));
            if (index >= 0) {
                const modifiedQuestion: Question = Object.assign({}, qForm[index]);
                modifiedQuestion.id = question.changes.id;
                qForm[index] = modifiedQuestion;
            }
            return questionAdapter.updateOne(question, {
                ...state,
                questionForm: qForm,
                savePendingQuestions: state.savePendingQuestions.slice(0).filter(p => p.position !== question.changes.position)
            });
        }
    ),
    on(DeleteQuestionSuccess,
        (state, {questionPosition}) => {
            const qForm: Question[] = [...state.questionForm];
            let curQuestion: Question|null = null;
            const index = qForm.findIndex((q => q.position === state.currentQuestionPosition));
            if (index >= 0) {
                qForm.splice(index, 1);
                const indexCurQuestion = qForm.findIndex(q => q.position === state.currentQuestionPosition);
                if (indexCurQuestion >= 0) {
                    curQuestion = qForm[indexCurQuestion];
                }
            }
            if (questionPosition !== null) {
                return questionAdapter.removeOne(questionPosition, {
                    ...state,
                    questionForm: qForm,
                    currentQuestion: curQuestion,
                    savePendingQuestions: state.savePendingQuestions.slice(0).filter(p => p.position !== questionPosition)
                });
            } else {
                return {
                    ...state,
                    questionForm: qForm,
                    currentQuestion: curQuestion,
                    savePendingQuestions: state.savePendingQuestions.slice(0).filter(p => p.position !== questionPosition)
                };
            }
        }
    ),
    on(CreatePropositionSuccess,
        (state, {questionPosition, proposition, index}) => {
            const curQuestion: Question = Object.assign({}, state.currentQuestion);
            const qForm: Question[] = [...state.questionForm];
            const indexQuestion: number = qForm.findIndex((q => q.position === questionPosition));
            if (indexQuestion >= 0) {
                // avoiding state & action mutability
                const modifiedQuestion: Question = Object.assign({}, qForm[indexQuestion]);
                const props: Proposition[] = [...modifiedQuestion.propositions];
                const createdProposition: Proposition = Object.assign({}, props[index]);
                createdProposition.id = proposition.id;
                props[index] = createdProposition;
                modifiedQuestion.propositions = [...props];
                qForm[indexQuestion] = modifiedQuestion;
            }
            const propositions: Proposition[] =
                state.entities[questionPosition].propositions !== null && state.entities[questionPosition].propositions !== undefined ?
                    [...state.entities[questionPosition].propositions] : [];
            propositions.push(proposition);
            if (questionPosition === state.currentQuestionPosition) {
                curQuestion.propositions = propositions.sort((a, b) => a.position - b.position);
            }
            return questionAdapter.updateOne({id: questionPosition, changes: {propositions}}, {
                ...state,
                currentQuestion: curQuestion,
                questionForm: qForm
            });
        }
    ),
    on(UpdatePropositionSuccess,
        (state, {questionPosition, id, proposition, index}) => {
            const curQuestion = Object.assign({}, state.currentQuestion);
            const propositions: Proposition[] = [...state.entities[questionPosition].propositions];
            propositions[index] = proposition;
            if (questionPosition === state.currentQuestionPosition) {
                curQuestion.propositions = propositions;
            }
            return questionAdapter.updateOne({id: questionPosition, changes: {propositions}}, {
                ...state,
                currentQuestion: curQuestion
            });
        }
    ),
    on(DeletePropositionSuccess,
        (state, {questionPosition, propositionId}) => {
            const curQuestion = Object.assign({}, state.currentQuestion);
            const propositions: Proposition[] = [...state.entities[questionPosition].propositions];
            propositions.splice(propositions.findIndex((prop) => prop.id === propositionId), 1);
            if (questionPosition === state.currentQuestionPosition) {
                curQuestion.propositions = propositions;
            }
            return questionAdapter.updateOne({id: questionPosition, changes: {propositions}}, {
                ...state,
                currentQuestion: curQuestion
            });
        }
    ),
    on(LoadQuizError, CreateQuestionError, UpdateQuestionError, DeletePropositionError,
        CreatePropositionError, UpdatePropositionError, DeletePropositionError,
        state => ({
            ...state,
            errorSaving: true
        })
    ),
    on(IncrementPosition,
        state => {
            const newCurQuestionPosition = state.currentQuestionPosition + 1;
            const findPositionInQuestionForm = state.questionForm.findIndex(q => q.position === newCurQuestionPosition);
            return {
                ...state,
                currentQuestion: findPositionInQuestionForm >= 0 ? state.questionForm[findPositionInQuestionForm] : null,
                currentQuestionPosition: newCurQuestionPosition
            };
        }
    ),
    on(DecrementPosition,
        state => {
            const newCurQuestionPosition = state.currentQuestionPosition - 1;
            const findPositionInQuestionForm = state.questionForm.findIndex(q => q.position === newCurQuestionPosition);
            return {
                ...state,
                currentQuestion: findPositionInQuestionForm >= 0 ? state.questionForm[findPositionInQuestionForm] : null,
                currentQuestionPosition: newCurQuestionPosition
            };
        }
    ),
    on(GoToPosition,
        (state, {position}) => ({
            ...state,
            currentQuestion: state.questionForm[position - 1] !== undefined ? state.questionForm[position - 1] : null,
            currentQuestionPosition: position
        })
    ),
    on(UpdateQuestionForm,
        (state, {question}) => {
            const modifiedQuestion: Question = Object.assign({}, question);
            const qForm: Question[] = [...state.questionForm];
            const index = qForm.findIndex((q => q.position === question.position));
            if (index >= 0) {
                if (!modifiedQuestion.id) {
                    modifiedQuestion.id = qForm[index].id;
                }

                // keeping proposition ids from original questionForm
                modifiedQuestion.propositions.slice().map((prop, i) => {
                    const proposition: Proposition = Object.assign({}, prop);
                    if (qForm[index].propositions[i] !== undefined) {
                        proposition.id = qForm[index].propositions[i].id;
                    }
                    return proposition;
                });
                qForm[index] = modifiedQuestion;
            } else {
                qForm.push(modifiedQuestion);
            }
            return {
                ...state,
                questionForm: qForm
            };
        }
    ),
    on(ResetErrorSaving,
        state => ({
            ...state,
            errorSaving: false
    })),
    on(UnsetAll,
        state => questionAdapter.removeAll({
            ...state,
            currentQuiz: null,
            currentQuestion: null,
            currentQuestionPosition: null,
            questionForm: [],
            loading: false
        })
    )
);
