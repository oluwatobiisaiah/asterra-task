// Common types used across the application

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  hobbies?: Hobby[];
}

export interface Hobby {
  id: number;
  hobby: string;
  userId: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsersWithHobbiesResponse {
  data: User[];
  pagination: PaginationInfo;
}

export type TabType = 'view-data' | 'add-user' | 'add-hobby';