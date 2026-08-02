/** Human-readable audit vocabulary — complements raw `action` codes in ISO audit trail. */

const KNOWN: Readonly<Record<string, string>> = {
  WORKFLOW_STATE_CHANGED: "Promjena stanja workflowa",
  CAPA_CREATED: "CAPA / NCR zapis kreiran",
  CAPA_CLOSED: "CAPA zatvoren",
  IMPARTIALITY_ACCEPTED: "Impartiality prihvaćen",
  CERTIFICATE_ISSUED: "Certifikat izdan",
  CERTIFICATE_SUSPENDED: "Certifikat suspendiran",
  CERTIFICATE_REVOKED: "Certifikat opozvan",
  RISK_ACCEPTED: "Rizik prihvaćen",
  MANAGEMENT_REVIEW_APPROVED: "Pregled rukovodstva odobren",
};

export function humanizeAuditAction(action: string): string {
  const k = action.trim();
  if (!k) return "Nepoznata akcija";
  return KNOWN[k] ?? k.replaceAll("_", " ");
}
