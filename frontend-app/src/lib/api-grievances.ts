/**

 * Formal complaints (B15 canonical Nest) and certification appeals (B14 canonical Nest).

 */



import {

  acknowledgeComplaint,

  getLearnerComplaint,

  getPublicComplaintStatus,

  getStaffComplaint,

  listLearnerComplaints,

  listStaffComplaints,

  submitLearnerComplaint,

  submitPublicComplaint,

  voidComplaint,

} from "@/lib/api/complaints-client";

import {

  acknowledgeAppeal,

  getLearnerAppeal,

  getStaffAppeal,

  listLearnerAppeals,

  listStaffAppeals,

  recordAppealDecision,

  startAppealDecision,

  submitLearnerAppeal,

  voidAppeal,

} from "@/lib/api/appeals-client";



export type {

  CaseCategory,

  ComplaintDetail,

  ComplaintListItem,

  ComplaintStatus,

  GrievanceEventItem,

  PublicComplaintStatusResult,

  PublicComplaintSubmitResult,

} from "@/lib/api/complaints-types";



export type {

  AppealDetail,

  AppealListItem,

  AppealOutcome,

  AppealStatus,

  B14DecisionOutcome,

} from "@/lib/api/appeals-types";



// --- Complaints (B15 canonical) ---



export async function fetchMyComplaints() {

  return listLearnerComplaints();

}



export async function fetchComplaintDetail(complaintId: string) {

  return getLearnerComplaint(complaintId);

}



export async function createComplaint(body: {

  readonly category: Exclude<import("@/lib/api/complaints-types").CaseCategory, "appeal">;

  readonly subject: string;

  readonly description: string;

  readonly certificationDecisionId?: string;

  readonly certificationApplicationId?: string;

  readonly certificateId?: string;

}) {

  return submitLearnerComplaint(body);

}



export async function fetchAdminComplaints() {

  return listStaffComplaints();

}



export async function fetchAdminComplaintDetail(complaintId: string) {

  return getStaffComplaint(complaintId);

}



/** Canonical B15 acknowledge — replaces FastAPI assign when canonical enabled. */

export async function adminAssignComplaint(

  complaintId: string,

  _body: { readonly assigneeUserId?: string; readonly committeeId?: string },

) {

  return acknowledgeComplaint(complaintId);

}



/** Not supported on B15 — use staff workflow routes in future slices. */

export async function adminComplaintNote(

  _complaintId: string,

  _body: { readonly note: string; readonly visibility: string },

): Promise<never> {

  throw {

    status: 410,

    code: "HTTP_ERROR",

    message: "COMPLAINT_NOTE_NOT_SUPPORTED",

  };

}



export { submitPublicComplaint, getPublicComplaintStatus, acknowledgeComplaint, voidComplaint };



/** @deprecated Use submitPublicComplaint — returns publicReference only. */

export async function submitPublicCase(body: {

  readonly category: Exclude<import("@/lib/api/complaints-types").CaseCategory, "appeal">;

  readonly subject: string;

  readonly description: string;

  readonly submitterEmail: string;

  readonly submitterName: string;

}): Promise<{ readonly complaintId: string; readonly publicViewToken: string; readonly message?: string }> {

  const r = await submitPublicComplaint(body);

  return {

    complaintId: r.publicReference,

    publicViewToken: r.publicReference,

    message: r.status,

  };

}



// --- Appeals (B14 canonical) ---



export async function fetchMyAppeals() {

  return listLearnerAppeals();

}



export async function fetchAppealDetail(appealId: string) {

  return getLearnerAppeal(appealId);

}



export async function submitCertificationAppeal(body: {

  readonly certificationDecisionId: string;

  readonly summary: string;

  readonly grounds: string;

}) {

  return submitLearnerAppeal(body);

}



export async function fetchAdminAppeals() {

  return listStaffAppeals();

}



export async function fetchAdminAppealDetail(appealId: string) {

  return getStaffAppeal(appealId);

}



/** Canonical B14 acknowledge — replaces FastAPI assign. */

export async function adminAppealAssign(

  appealId: string,

  _body: { readonly handlerUserId?: string; readonly committeeId?: string },

) {

  return acknowledgeAppeal(appealId);

}



/** Not supported on B14 — use voidAppeal with reason. */

export async function adminAppealNote(

  _appealId: string,

  _body: { readonly note: string; readonly visibility: string },

): Promise<never> {

  throw {

    status: 410,

    code: "HTTP_ERROR",

    message: "APPEAL_NOTE_NOT_SUPPORTED",

  };

}



export async function adminDecideAppeal(

  appealId: string,

  body: {

    readonly outcome: import("@/lib/api/appeals-types").AppealOutcome;

    readonly outcomeComment: string;

    readonly resolutionCommitteeId: string;

  },

) {

  void body.resolutionCommitteeId;

  try {

    await startAppealDecision(appealId);

  } catch (err: unknown) {

    const status =

      err && typeof err === "object" && "status" in err ? Number((err as { status: number }).status) : 0;

    if (status !== 409) {

      throw err;

    }

  }

  return recordAppealDecision(appealId, {

    outcome: body.outcome,

    outcomeComment: body.outcomeComment,

  });

}



export { acknowledgeAppeal, voidAppeal };


