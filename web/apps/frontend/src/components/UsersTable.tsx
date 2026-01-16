import { useUsersData } from '../hooks/useUsersData';
import { useMutations } from '../hooks/useMutations';
import { TableSkeleton } from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/table/EmptyState';
import Pagination from '../components/table/Pagination';
import UserTableRow from '../components/table/UserTableRow';
import { Card } from '../components/ui/Card';

export default function UsersTable() {
  const { data: response, isLoading, error, page, setPage, limit } = useUsersData();
  const { deletingUserId, deletingHobbyId, handleDeleteUser, handleDeleteHobby } = useMutations();

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  const users = response?.data || [];
  const pagination = response?.pagination;

  if (users.length === 0 && page === 1) {
    return (
      <EmptyState
        title="No Users Yet"
        description="Get started by creating your first user profile. Click on 'New User' to begin!"
        actionText="Ready when you are"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">All Users</h2>
          {pagination && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)} of {pagination.total} users
            </p>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-16 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="w-48 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="w-64 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Address
                </th>
                <th className="w-40 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Phone
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hobbies
                </th>
                <th className="w-32 px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user,index) => (
                <UserTableRow
                  key={user.id}
                  id={index + 1 + (page - 1) * limit}
                  user={user}
                  onDeleteUser={handleDeleteUser}
                  onDeleteHobby={handleDeleteHobby}
                  deletingUserId={deletingUserId}
                  deletingHobbyId={deletingHobbyId}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}