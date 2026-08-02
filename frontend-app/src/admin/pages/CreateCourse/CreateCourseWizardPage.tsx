import { type JSX } from "react";
import { Link } from "react-router";

import { Step1BasicInfo } from "@/admin/pages/CreateCourse/Step1BasicInfo";

/** Admin: kreiranje obuke — Korak 1 (čarobnjak); detaljni moduli u „Kreiranje obuke”. */
export default function CreateCourseWizardPage(): JSX.Element {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Nova obuka</h1>
        <p className="mt-1 text-sm text-slate-500">
          Korak 1 — osnovni podaci; zatim u &quot;Kreiranje obuke&quot; kurikulum, ispit, certifikat, certifikacijski put i
          objava (tabovi ili{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">?tab=publish</code>).
        </p>
      </div>
      <Step1BasicInfo />
      <p className="text-xs text-slate-500">
        Nakon što imate{" "}
        <span className="font-mono text-slate-700">courseId</span>, otvorite{" "}
        <Link className="font-medium text-sky-700 underline" to="/dashboard/admin/kreiraj-kurs">
          Kreiranje obuke
        </Link>{" "}
        i dodajte parametar{" "}
        <span className="font-mono">
          ?courseId=…&amp;tab=exam
        </span>{" "}
        (ili{" "}
        <span className="font-mono">
          certificate
        </span>
        ,{" "}
        <span className="font-mono">
          certification
        </span>
        ,{" "}
        <span className="font-mono">
          publish
        </span>
        ) za izravni skok na odjeljak.
      </p>
    </div>
  );
}
