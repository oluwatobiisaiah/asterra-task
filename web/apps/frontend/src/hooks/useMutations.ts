import { useState } from 'react';
import { trpc } from '../lib/trpc';

export function useMutations() {
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deletingHobbyId, setDeletingHobbyId] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);

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
    setConfirmation({
      isOpen: true,
      message: 'Are you sure you want to delete this user? This will also delete all their hobbies.',
      onConfirm: () => {
        setDeletingUserId(userId);
        deleteUser.mutate({ id: userId });
        setConfirmation(null);
      },
    });
  };

  const handleDeleteHobby = (hobbyId: number) => {
    setConfirmation({
      isOpen: true,
      message: 'Are you sure you want to delete this hobby?',
      onConfirm: () => {
        setDeletingHobbyId(hobbyId);
        deleteHobby.mutate({ id: hobbyId });
        setConfirmation(null);
      },
    });
  };

  return {
    deletingUserId,
    deletingHobbyId,
    handleDeleteUser,
    handleDeleteHobby,
    isDeletingUser: deleteUser.isPending,
    isDeletingHobby: deleteHobby.isPending,
    confirmation,
    cancelConfirmation: () => setConfirmation(null),
  };
}