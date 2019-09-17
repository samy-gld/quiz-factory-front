import { Quiz } from '../../../model/IQuiz';
import {
    CreateQuizSuccess, DeleteQuizSuccess, FinalizeQuizSuccess, InviteParticipantSuccess, LoadInvitationsSuccess,
    LoadQuizzes, LoadQuizzesSuccess, UpdateQuizSuccess
} from '../actions/quiz.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { Invitation } from '../../../model/IInvitation';

export interface QuizState  extends EntityState<Quiz> {
    loading: boolean;
    invitedUsersByQuiz: Invitation[];
}

export const quizAdapter: EntityAdapter<Quiz> = createEntityAdapter<Quiz>();

export const initialQuizState: QuizState = quizAdapter.getInitialState({
    loading: false,
    invitedUsersByQuiz: []
});

/**** Selectors ****/
export const selectQuizState =
    createFeatureSelector<QuizState>('quizzes');
export const selectAllQuizzes = createSelector(
    selectQuizState,
    (state: QuizState) => state
);
export const {
    selectIds: selectQuizIds,
    selectEntities: selectQuizEntities,
    selectAll: selectQuizzes,
    selectTotal: countQuizzes
} = quizAdapter.getSelectors(selectAllQuizzes);

export const getLoading = (state: QuizState): boolean => state.loading;
export const selectLoading = createSelector(selectQuizState, getLoading);

export const getInvitations = (state: QuizState): Invitation[] => state.invitedUsersByQuiz;
export const selectInvitations = createSelector(selectQuizState, getInvitations);

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
    on(LoadInvitationsSuccess,
        (state, {invitations}) => ({
            ...state,
            invitedUsersByQuiz: invitations
        })
    ),
    on(InviteParticipantSuccess,
        (state, {invitation}) => ({
            ...state,
            invitedUsersByQuiz: [...state.invitedUsersByQuiz, invitation]
        })
    )
);
