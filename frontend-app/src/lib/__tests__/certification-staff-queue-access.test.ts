import { describe, expect, it } from "vitest";

import {
  evaluateCertificationApplicationsQueueAccess,
  evaluateCertificationDecisionsReaderAccess,
} from "@/lib/certification-staff-queue-access";

describe("certification-staff-queue-access", () => {
  it("tech_committee nije u cert applications queue", () => {
    expect(evaluateCertificationApplicationsQueueAccess({ roleFromProfile: "tech_committee" })).toBe(false);
  });

  it("director je u queue i decision reader skupu", () => {
    expect(evaluateCertificationApplicationsQueueAccess({ roleFromProfile: "director" })).toBe(true);
    expect(evaluateCertificationDecisionsReaderAccess({ roleFromProfile: "director" })).toBe(true);
  });

  it("cert_committee je u queue i reader", () => {
    expect(evaluateCertificationApplicationsQueueAccess({ roleFromProfile: "cert_committee" })).toBe(true);
    expect(evaluateCertificationDecisionsReaderAccess({ roleFromProfile: "cert_committee" })).toBe(true);
  });

  it("COM_CERT Nest role alias is allowed for staff queue", () => {
    expect(evaluateCertificationApplicationsQueueAccess({ roleFromProfile: "COM_CERT" })).toBe(true);
  });

  it("STAFF_DIR and STAFF_SYSADM Nest role aliases are allowed", () => {
    expect(evaluateCertificationApplicationsQueueAccess({ roleFromProfile: "STAFF_DIR" })).toBe(true);
    expect(evaluateCertificationApplicationsQueueAccess({ roleFromProfile: "STAFF_SYSADM" })).toBe(true);
  });

  it("learner is not in staff queue access", () => {
    expect(evaluateCertificationApplicationsQueueAccess({ roleFromProfile: "learner" })).toBe(false);
  });
});
