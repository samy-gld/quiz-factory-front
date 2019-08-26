import { Quiz } from '../../../model/IQuiz';
import {
    CreateQuizSuccess, DeleteQuizSuccess, FinalizeQuizSuccess, InviteParticipantSuccess,
    LoadQuizzes, LoadQuizzesSuccess, UpdateQuizSuccess
} from '../actions/quiz.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';

export interface QuizState  extends EntityState<Quiz> {
    loading: boolean;
    invitedUsersByQuiz: any[];
}

export const quizAdapter: EntityAdapter<Quiz> = createEntityAdapter<Quiz>();

export const initialQuizState: QuizState = quizAdapter.getInitialState({
    loading: false,
    invitedUsersByQuiz: []
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
    on(InviteParticipantSuccess,
        (state, {quizId, invitedUser}) => {
        const invitedUsersByQuiz = state.invitedUsersByQuiz.slice(0);
        const index = invitedUsersByQuiz.findIndex(i => i.quizId === quizId);
        let invitedUsers;
        if (index >= 0) {
            invitedUsers = [...state.invitedUsersByQuiz[index].invitedUsers, invitedUser];
            invitedUsersByQuiz[index].invitedUsers = invitedUsers;
        } else {
            invitedUsers = [invitedUser];
            invitedUsersByQuiz.push({quizId, invitedUsers});
        }
        return {
            ...state,
            invitedUsersByQuiz
        };
        }
    )
);
