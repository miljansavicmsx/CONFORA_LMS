/**

 * ISO 17024 — Item bank API (aliasi za Tačku 12.5 / HITL; implementacija u `api-exams.ts`).

 */



import type { ItemBankQuestionStatus } from "@/lib/api-exams";



export type {

  ItemBankQuestion,

  ItemBankQuestionCreatePayload,

  ItemBankQuestionStatus,

  ItemBankQuestionUpdatePayload,

  ItemBankQuestionType,

  QuestionDifficulty,

} from "@/lib/api-exams";



export type QuestionStatus = ItemBankQuestionStatus;



export {

  approveQuestionContent,

  approveQuestionContent as approveAiQuestion,

  createAiPlaceholderQuestion,

  createQuestion,

  deleteQuestion,

  fetchQuestions as fetchItemBank,

  publishQuestionToBank,

  rejectQuestionAiContent,

  rejectQuestionReview,

  retireQuestion,

  submitQuestionForReview,

  updateQuestion,

} from "@/lib/api-exams";


