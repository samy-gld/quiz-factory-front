export interface Proposition {
    id?: number;
    label: string;
    wrightAnswer: boolean;
    position?: number;
}

export type QuestionType = 'qcm' | 'duo' | 'carre';

export interface Question {
    id?: number;
    label: string;
    type: QuestionType;
    position?: number;
    propositions: Proposition[];
}

export interface Quiz {
    id?: number;
    name: string;
    description: string;
    status: 'pending'|'finalized';
    createdAt?: Date;
    lastUpdate?: Date;
    questions: Question[];
}
