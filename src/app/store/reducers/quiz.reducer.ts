import { Quiz } from '../../model/IQuiz';
import {CreateQuizSuccess, DeleteQuizSuccess, LoadQuiz, LoadQuizSuccess, LoadQuizzes, LoadQuizzesSuccess} from '../actions/quiz.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';

export interface QuizState  extends EntityState<Quiz> {
    currentQuiz: Quiz | null;
    loading: boolean;
}

export const quizAdapter: EntityAdapter<Quiz> = createEntityAdapter<Quiz>();

export const initialQuizState: QuizState = quizAdapter.getInitialState({
    currentQuiz: null,
    loading: false
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

export const getCurrentQuiz = (state: QuizState): Quiz => state.currentQuiz;
export const selectCurrentQuiz = createSelector(selectQuizState, getCurrentQuiz);

export const getLoading = (state: QuizState): boolean => state.loading;
export const selectLoading = createSelector(selectQuizState, getLoading);

export const getCurrentQuizStatus = (state: QuizState): string => state.currentQuiz.status;
export const selectCurrentQuizStatus = createSelector(selectQuizState, getCurrentQuizStatus);

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
            currentQuiz: null,
            loading: false
        })
    ),
    on(CreateQuizSuccess,
        (state, {quiz}) => quizAdapter.addOne(quiz, {
            ...state,
            currentQuiz: quiz,
        })
    ),
    on(DeleteQuizSuccess,
        (state, {id}) => quizAdapter.removeOne(id, {
            ...state,
            currentQuiz: null,
        })
    ),
    on(LoadQuiz,
        (state) => ({...state, loading: true})
    ),
    on(LoadQuizSuccess,
        (state, {quiz}) => ({
            ...state,
            currentQuiz: quiz,
            loading: false
        })
    )
);
