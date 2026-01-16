import { useState } from 'react';
import { trpc } from '../lib/trpc';

export function useMutations() {
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deletingHobbyId, setDeletingHobbyId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const deleteUser = trpc.user.delete.useMutation({
    onSuccess: () => {
      utils.data.getUsersWithHobbies.invalidate();
      utils.user.getAll.invalidate();
      setDeletingUserId(null);
    },
    onError: () => {
      setDeletingUserId(null);
    },
  });

  const deleteHobby = trpc.hobby.delete.useMutation({
    onSuccess: () => {
      utils.data.getUsersWithHobbies.invalidate();
      setDeletingHobbyId(null);
    },
    onError: () => {
      setDeletingHobbyId(null);
    },
  });

  const handleDeleteUser = (userId: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this user? This will also delete all their hobbies.'
      )
    ) {
      setDeletingUserId(userId);
      deleteUser.mutate({ id: userId });
    }
  };

  const handleDeleteHobby = (hobbyId: number) => {
    if (window.confirm('Are you sure you want to delete this hobby?')) {
      setDeletingHobbyId(hobbyId);
      deleteHobby.mutate({ id: hobbyId });
    }
  };

  return {
    deletingUserId,
    deletingHobbyId,
    handleDeleteUser,
    handleDeleteHobby,
    isDeletingUser: deleteUser.isPending,
    isDeletingHobby: deleteHobby.isPending,
  };
}