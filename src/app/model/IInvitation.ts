import { Quiz } from './IQuiz';
import { Execution } from './IExecution';

export interface Invitation {
    id?: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    token?: string;
    execution?: Execution;
    quiz?: number | Quiz; // quiz id for post | complete Quiz from get
}
