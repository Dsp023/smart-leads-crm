import React from 'react';

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse border-b border-slate-200 dark:border-slate-800/40">
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/5"></div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded ml-auto w-10"></div>
      </td>
    </tr>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-950/40">
          <tr>
            <th className="px-6 py-3 text-left"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div></th>
            <th className="px-6 py-3 text-left"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></th>
            <th className="px-6 py-3 text-left"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></th>
            <th className="px-6 py-3 text-left"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></th>
            <th className="px-6 py-3 text-left"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></th>
            <th className="px-6 py-3 text-left"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></th>
            <th className="px-6 py-3 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto w-10"></div></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {Array.from({ length: rows }).map((_, idx) => (
            <TableRowSkeleton key={idx} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const MetricSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <div className="space-y-3 w-2/3">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
      </div>
      <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
    </div>
  );
};
