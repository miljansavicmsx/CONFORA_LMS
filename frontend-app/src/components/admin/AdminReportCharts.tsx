import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { JSX } from "react";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export type ChartRow = { readonly label: string; readonly value: number };

type AdminReportChartsProps = {
  readonly certificationApplicationsByStatus: readonly ChartRow[];
  readonly certificationDecisionsByOutcome: readonly ChartRow[];
  readonly certificateLifecycleByStatus: readonly ChartRow[];
  readonly educationEnrolmentByStatus: readonly ChartRow[];
  readonly learnerProgressDistribution: readonly ChartRow[];
  readonly auditActivityByDomain: readonly ChartRow[];
};

function EmptyChart({ label }: { readonly label: string }): JSX.Element {
  return (
    <p className="py-8 text-center text-xs text-text-muted" data-testid={`admin-chart-empty-${label}`}>
      Još nema podataka za ovaj grafikon.
    </p>
  );
}

function StatusBarChart({
  title,
  data,
  testId,
}: {
  readonly title: string;
  readonly data: readonly ChartRow[];
  readonly testId: string;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-border/40 p-3" data-testid={testId}>
      <h3 className="mb-2 text-xs font-medium">{title}</h3>
      {data.length === 0 ? (
        <EmptyChart label={testId} />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[...data]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function StatusPieChart({
  title,
  data,
  testId,
}: {
  readonly title: string;
  readonly data: readonly ChartRow[];
  readonly testId: string;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-border/40 p-3" data-testid={testId}>
      <h3 className="mb-2 text-xs font-medium">{title}</h3>
      {data.length === 0 ? (
        <EmptyChart label={testId} />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={[...data]} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={65}>
              {[...data].map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function AdminReportCharts({
  certificationApplicationsByStatus,
  certificationDecisionsByOutcome,
  certificateLifecycleByStatus,
  educationEnrolmentByStatus,
  learnerProgressDistribution,
  auditActivityByDomain,
}: AdminReportChartsProps): JSX.Element {
  return (
    <div className="grid gap-4 lg:grid-cols-2" data-testid="admin-reports-charts">
      <StatusBarChart
        title="Prijave za certifikaciju po statusu"
        data={certificationApplicationsByStatus}
        testId="admin-chart-cert-applications"
      />
      <StatusBarChart
        title="Odluke o certifikaciji po ishodu"
        data={certificationDecisionsByOutcome}
        testId="admin-chart-cert-decisions"
      />
      <StatusPieChart
        title="Raspodjela životnog ciklusa certifikata"
        data={certificateLifecycleByStatus}
        testId="admin-chart-cert-lifecycle"
      />
      <StatusBarChart
        title="Upisi edukacije po statusu"
        data={educationEnrolmentByStatus}
        testId="admin-chart-edu-enrolments"
      />
      <StatusPieChart
        title="Raspodjela napretka polaznika"
        data={learnerProgressDistribution}
        testId="admin-chart-learner-progress"
      />
      <StatusBarChart
        title="Audit aktivnost po domeni"
        data={auditActivityByDomain}
        testId="admin-chart-audit-domain"
      />
    </div>
  );
}
