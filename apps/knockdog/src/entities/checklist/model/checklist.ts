interface Answer {
  questionId: string;
  question: string;
  value: string;
}

interface AnswerGroup {
  sectionId: string;
  title: string;
  answers: Answer[];
}

interface QuestionGroup {
  id: string;
  title: string;
  questions: Question[];
}

interface Question {
  id: string;
  label: string;
  type: 'TRI_STATE' | 'INTEGER';
}

export type { Answer, AnswerGroup, QuestionGroup, Question };
