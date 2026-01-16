import { useState } from 'react';
import { trpc } from '../lib/trpc';
import type { UsersWithHobbiesResponse } from '../types/common';

export function useUsersData() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    data: response,
    isLoading,
    error
  } = trpc.data.getUsersWithHobbies.useQuery({
    page,
    limit,
  });

  const utils = trpc.useUtils();

  const refetch = () => {
    utils.data.getUsersWithHobbies.invalidate();
  };

  return {
    data: response as UsersWithHobbiesResponse | undefined,
    isLoading,
    error,
    page,
    setPage,
    limit,
    refetch,
  };
}