import {Question, Quiz} from '../../model/IQuiz';
import {
    CreateQuizSuccess, DeleteQuizSuccess, FinalizeQuizSuccess,
    LoadQuizzes, LoadQuizzesSuccess,
    Login, Logout, UpdateQuizSuccess
} from '../actions/quiz.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import {selectQuestionEntities} from './question.reducer';

export interface QuizState  extends EntityState<Quiz> {
    loading: boolean;
    isAuthenticated: boolean;
}

export const quizAdapter: EntityAdapter<Quiz> = createEntityAdapter<Quiz>();

export const initialQuizState: QuizState = quizAdapter.getInitialState({
    loading: false,
    isAuthenticated: false
});

/**** Selectors ****/
export const selectQuizState =
    createFeatureSelector<QuizState>('quizzes');
export const selectAllQuizzess = createSelector(
    selectQuizState,
    (state: QuizState) => state
);
export const {
    selectIds: selectQuizIds,
    selectEntities: selectQuizEntities,
    selectAll: selectQuizzes,
    selectTotal: countQuizzes
} = quizAdapter.getSelectors(selectAllQuizzess);

export const getLoading = (state: QuizState): boolean => state.loading;
export const selectLoading = createSelector(selectQuizState, getLoading);

export const getIsAuthenticated = (state: QuizState): boolean => state.isAuthenticated;
export const selectIsAuthenticated = createSelector(selectQuizState, getIsAuthenticated);

/**** Reducer ****/
export const quizReducer = createReducer(
    initialQuizState,
    on(LoadQuizzes,
        (state) => ({
            ...state,
            loading: true,
        })
    ),
    on(LoadQuizzesSuccess,
        (state, {quizzes}) => quizAdapter.addMany(quizzes, {
            ...state,
            loading: false
        })
    ),
    on(CreateQuizSuccess,
        (state, {quiz}) => quizAdapter.addOne(quiz, state)
    ),
    on(UpdateQuizSuccess, FinalizeQuizSuccess,
        (state, {quiz}) => quizAdapter.updateOne({id: quiz.id, changes: quiz}, state)
    ),
    on(DeleteQuizSuccess,
        (state, {id}) => quizAdapter.removeOne(id, state)
    ),
    on(Login,
        state => ({
            ...state,
            isAuthenticated: true
        })
    ),
    on(Logout,
        state => ({
            ...state,
            isAuthenticated: false
        })
    )
);
