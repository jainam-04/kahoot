import React from 'react';
import { Check, X } from 'lucide-react';

const comparisonRows = [
  { feature: 'Quiz Limit', free: '5 Quizzes', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Participant Limit', free: '20 Players', pro: 'Unlimited', enterprise: 'Custom Unlimited' },
  { feature: 'Analytics & Export Reports', free: 'Basic', pro: 'Advanced PDF/CSV', enterprise: 'Custom BI Export' },
  { feature: 'Question Bank & Custom Branding', free: false, pro: true, enterprise: true },
  { feature: 'Support Level', free: false, pro: 'Priority Email', enterprise: '24/7 Dedicated Manager' },
  { feature: 'API & Institution Admin Dashboard', free: false, pro: false, enterprise: true },
];

function CellValue({ value, variant }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-3.5 w-3.5 text-emerald-500 mx-auto stroke-[2.5]" />
    ) : (
      <X className="h-3.5 w-3.5 text-slate-300 mx-auto stroke-[2]" />
    );
  }

  if (variant === 'pro') {
    return <span className="text-[#6C38FF] font-bold text-[11px] sm:text-xs">{value}</span>;
  }

  if (variant === 'enterprise') {
    return <span className="text-blue-600 font-bold text-[11px] sm:text-xs">{value}</span>;
  }

  return <span className="text-slate-600 text-[11px] sm:text-xs">{value}</span>;
}

export default function PlanComparisonTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[320px] text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-2 px-2 text-[11px] sm:text-xs font-bold text-slate-600">Features</th>
            <th className="py-2 px-2 text-[11px] sm:text-xs font-bold text-center text-slate-600 bg-slate-100/70 rounded-t-md">Free</th>
            <th className="py-2 px-2 text-[11px] sm:text-xs font-extrabold text-center text-[#6C38FF] bg-purple-100/70 rounded-t-md">Pro</th>
            <th className="py-2 px-2 text-[11px] sm:text-xs font-bold text-center text-blue-600 bg-blue-50/70 rounded-t-md">Enterprise</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {comparisonRows.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-100/40 transition-colors">
              <td className="py-2 px-2 text-[11px] sm:text-xs font-medium text-slate-700 leading-tight">{row.feature}</td>
              <td className="py-2 px-2 text-center bg-slate-50/40">
                <CellValue value={row.free} variant="free" />
              </td>
              <td className="py-2 px-2 text-center bg-purple-50/40 font-semibold">
                <CellValue value={row.pro} variant="pro" />
              </td>
              <td className="py-2 px-2 text-center bg-blue-50/20">
                <CellValue value={row.enterprise} variant="enterprise" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
