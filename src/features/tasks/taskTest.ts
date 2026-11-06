export type TaskTestSubmission = { files: Record<string,string> } | { answers: {question_id:string;choice_id:string}[] };
export interface TaskTestResult { passed:boolean; checks:{name:string;passed:boolean;message?:string}[]; stdout?:string; stderr?:string }
