import { Quiz } from './IQuiz';
import { Answer } from './IAnswer';

export interface Execution {
    id?: number;
    invitation?: string; // invitation token
    quiz?: Quiz;
    started?: boolean;
    finished?: boolean;
    currentPosition?: number;
    answers?: Answer[];
}
