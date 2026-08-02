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

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

type ChartRow = { readonly label: string; readonly value: number };

type EducationChartsProps = {
  readonly progressDistribution: readonly ChartRow[];
  readonly courseStatus: readonly ChartRow[];
  readonly enrolmentByStatus?: readonly ChartRow[];
  readonly activity?: readonly ChartRow[];
};

export function EducationCharts({
  progressDistribution,
  courseStatus,
  enrolmentByStatus,
  activity,
}: EducationChartsProps): JSX.Element {
  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-2" data-testid="admin-education-recharts">
      <div className="rounded-lg border border-border/40 p-3" data-testid="admin-chart-progress-pie">
        <h3 className="mb-2 text-xs font-medium">Progress distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={[...progressDistribution]} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70}>
              {[...progressDistribution].map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border border-border/40 p-3" data-testid="admin-chart-course-status">
        <h3 className="mb-2 text-xs font-medium">Course status</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={[...courseStatus]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {enrolmentByStatus && enrolmentByStatus.length > 0 ? (
        <div className="rounded-lg border border-border/40 p-3" data-testid="admin-chart-enrolment-status">
          <h3 className="mb-2 text-xs font-medium">Enrolment status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[...enrolmentByStatus]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
      {activity && activity.length > 0 ? (
        <div className="rounded-lg border border-border/40 p-3" data-testid="admin-chart-activity">
          <h3 className="mb-2 text-xs font-medium">Report & notification activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[...activity]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}
