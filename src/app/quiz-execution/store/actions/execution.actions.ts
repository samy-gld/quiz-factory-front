import { createAction, props, union } from '@ngrx/store';
import { Execution } from '../../../model/IExecution';
import {Invitation} from '../../../model/IInvitation';
import {Answer} from '../../../model/IAnswer';

export const LoadInvitation = createAction(
    '[Invitation] Load invitation',
    props<{token: string}>()
);

export const LoadInvitationSuccess = createAction(
    '[Invitation] Load invitation success',
    props<{invitation: Invitation}>()
);

export const LoadInvitationError = createAction(
    '[Invitation] Load invitation error',
    props<{err: string}>()
);

export const LoadExecution = createAction(
    '[Execution] Load execution',
    props<{token: string}>()
);

export const LoadExecutionSuccess = createAction(
    '[Execution] Load execution success',
    props<{execution: Execution}>()
);

export const LoadExecutionError = createAction(
    '[Execution] Load execution error',
    props<{err: string}>()
);

export const PostExecution = createAction(
    '[Execution] Post execution',
    props<{execution: Execution}>()
);

export const PostExecutionSuccess = createAction(
    '[Execution] Post execution success',
    props<{execution: Execution}>()
);

export const PostExecutionError = createAction(
    '[Execution] Post execution error',
    props<{err: string}>()
);

export const PostAnswer = createAction(
    '[Quiz Launcher] Post an answer',
    props<{executionId: number, answer: Answer}>()
);

export const PostAnswerSuccess = createAction(
    '[Quiz Launcher] Post an answer success',
    props<{answer: Answer}>()
);

export const PostAnswerError = createAction(
    '[Quiz Launcher] Post an answer error',
    props<{err: string}>()
);

export const ResetError = createAction(
    '[Execution] Reset error'
);

const actions = union({
    LoadInvitation, LoadInvitationSuccess, LoadInvitationError,
    LoadExecution, LoadExecutionSuccess, LoadExecutionError,
    PostExecution, PostExecutionSuccess, PostExecutionError,
    PostAnswer, PostAnswerSuccess, PostAnswerError,
    ResetError
});

export type ActionsUnion = typeof actions;
