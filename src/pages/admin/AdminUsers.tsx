import React, { useState } from 'react';
import { Users, CheckCircle, XCircle, Shield, User } from 'lucide-react';
import { useAdminUserList } from '../../hooks/queries/useAdminUsers';
import type { AdminUser } from '../../services/adminUserService';

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const isAdmin = role?.toLowerCase() === 'admin';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isAdmin
          ? 'bg-violet-50 text-violet-700 border-violet-200'
          : 'bg-slate-50 text-slate-600 border-slate-200'
      }`}
    >
      {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
      {role ?? 'user'}
    </span>
  );
};

const ActiveBadge: React.FC<{ active: boolean }> = ({ active }) =>
  active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      <CheckCircle className="w-3 h-3" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
      <XCircle className="w-3 h-3" /> Inactive
    </span>
  );

const AdminUsers: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUserList(page);

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8" />
          <h2 className="text-3xl font-bold">Users</h2>
        </div>
        <p className="text-slate-300">View registered users and their roles</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-slate-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Phone / Email</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Role</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user: AdminUser) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {user.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {user.phone || user.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ActiveBadge active={user.is_active} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Total: <span className="font-medium">{pagination.total}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.has_more}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
