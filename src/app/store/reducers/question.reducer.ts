import {Proposition, Question} from '../../model/IQuiz';
import {
    CreatePropositionCancelled, CreatePropositionSuccess, CreateQuestionSuccess,
    DecrementPosition, DeletePropositionCancelled, DeletePropositionSuccess, IncrementPosition, LoadQuestions,
    LoadQuestionsSuccess, UnsetAll, UpdatePropositionCancelled, UpdatePropositionSuccess, UpdateQuestionSuccess
} from '../actions/question.actions';
import {createEntityAdapter, EntityAdapter, EntityState, Update} from '@ngrx/entity';
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';

/********** State **********/
export interface QuestionState  extends EntityState<Question> {
    currentQuestion: Question | null;
    currentQuestionPosition: number | null;
    loading: boolean;
}

export const questionAdapter: EntityAdapter<Question> = createEntityAdapter<Question>({
    sortComparer: sortQuestionByPosition,
    selectId: question => question.position
});

function sortQuestionByPosition(q1: Question, q2: Question) {
    return q1.position - q2.position;
}

export const initialQuestionState: QuestionState = questionAdapter.getInitialState({
    currentQuestion: null,
    currentQuestionPosition: null,
    loading: false
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

export const getCurrentQuestion = (state: QuestionState): Question => state.currentQuestion;
export const selectCurrentQuestion = createSelector(selectQuestionState, getCurrentQuestion);

export const getCurrentQuestionPosition = (state: QuestionState): number => state.currentQuestionPosition;
export const selectCurrentQuestionPosition = createSelector(selectQuestionState, getCurrentQuestionPosition);

export const getLoading = (state: QuestionState): boolean => state.loading;
export const selectLoading = createSelector(selectQuestionState, getLoading);

export const getQuestionByPosition = (position: number) => (entities): Question => entities[position] ? entities[position] : null;
export const selectQuestionByPosition = (position) =>
    createSelector(selectQuestionEntities, getQuestionByPosition(position));

/********** Reducer **********/
export const questionReducer = createReducer(
    initialQuestionState,
    on(LoadQuestions,
        (state) => ({...state, loading: true})
    ),
    on(LoadQuestionsSuccess,
        (state, {questions}) => questionAdapter.addMany(questions, {
            ...state,
            currentQuestion: questions.length !== 0 ? questions[0].position === 1 ? questions[0] : null : null,
            currentQuestionPosition: 1,
            loading: false
        })
    ),
    on(CreateQuestionSuccess,
        (state, {question}) => questionAdapter.addOne(question, state)
    ),
    on(UpdateQuestionSuccess,
        (state, {question}) => questionAdapter.updateOne(question, state)
    ),
    on(CreatePropositionSuccess,
        (state, {questionPosition, proposition}) => {
            const propositions: Proposition[] = state.entities[questionPosition].propositions.slice(0);
            propositions.push(proposition);
            return questionAdapter.updateOne({id: questionPosition, changes: {propositions}}, state);
        }
    ),
    on(UpdatePropositionSuccess,
        (state, {questionPosition, id, proposition, index}) => {
            const propositions: Proposition[] = state.entities[questionPosition].propositions.slice(0);
            propositions[index] = proposition;
            return questionAdapter.updateOne({id: questionPosition, changes: {propositions}}, state);
        }
    ),
    on(DeletePropositionSuccess,
        (state, {questionPosition, propositionId}) => {
            console.log('REDUCER DELETE POSITION: ', questionPosition);
            const propositions: Proposition[] = state.entities[questionPosition].propositions.slice(0);
            console.log('Propositions avant : ', propositions);
            propositions.splice(propositions.findIndex((prop) => prop.id === propositionId), 1);
            console.log('Propositions apres : ', propositions);
            return questionAdapter.updateOne({id: questionPosition, changes: {propositions}}, state);
        }
    ),
    on(CreatePropositionCancelled, UpdatePropositionCancelled, DeletePropositionCancelled,
        (state) => ({...state})
    ),
    on(IncrementPosition,
        state => ({
            ...state,
            currentQuestion: state.entities[state.currentQuestionPosition + 1] !== undefined ?
                state.entities[state.currentQuestionPosition + 1] : null,
            currentQuestionPosition: state.currentQuestionPosition + 1
        })
    ),
    on(DecrementPosition,
        state => ({
            ...state,
            currentQuestion: state.entities[state.currentQuestionPosition - 1] !== undefined ?
                state.entities[state.currentQuestionPosition - 1] : null,
            currentQuestionPosition: state.currentQuestionPosition - 1
        })
    ),
    on(UnsetAll,
        state => ({
            ...state,
            currentQuestion: null,
            currentQuestionPosition: null,
            loading: false
        }))
);
