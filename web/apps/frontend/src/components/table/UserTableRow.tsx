import React, { useCallback } from 'react';
import { Trash2, X } from 'lucide-react';
import type { User } from '../../types/common';

interface UserTableRowProps {
  id: number;
  user: User;
  onDeleteUser: (userId: number) => void;
  onDeleteHobby: (hobbyId: number) => void;
  deletingUserId: number | null;
  deletingHobbyId: number | null;
}

const UserTableRow = React.memo<UserTableRowProps>(({
    id,
  user,
  onDeleteUser,
  onDeleteHobby,
  deletingUserId,
  deletingHobbyId
}) => {
  const handleDeleteUser = useCallback(() => {
    onDeleteUser(user.id);
  }, [user.id, onDeleteUser]);

  const handleDeleteHobby = useCallback((hobbyId: number) => {
    onDeleteHobby(hobbyId);
  }, [onDeleteHobby]);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-xs">
          {id}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-white font-bold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="text-sm text-gray-700 truncate">{user.address}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
        <div className="text-xs font-mono text-gray-700">{user.phone}</div>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {user.hobbies && user.hobbies.length > 0 ? (
            user.hobbies.map((hobby) => (
              <span key={hobby.id} className="badge badge-primary group/badge">
                {hobby.hobby}
                <button
                  onClick={() => handleDeleteHobby(hobby.id)}
                  disabled={deletingHobbyId === hobby.id}
                  className="hover:bg-gray-300 rounded-full p-1 transition-all disabled:opacity-50 opacity-0 group-hover/badge:opacity-100"
                  title="Delete hobby"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500 italic">No hobbies</span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <button
          onClick={handleDeleteUser}
          disabled={deletingUserId === user.id}
          className="btn btn-danger text-sm"
        >
          {deletingUserId === user.id ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Delete
            </>
          )}
        </button>
      </td>
    </tr>
  );
});

UserTableRow.displayName = 'UserTableRow';

export default UserTableRow;