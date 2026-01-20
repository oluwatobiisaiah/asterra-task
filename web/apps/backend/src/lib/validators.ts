import { z } from 'zod';
// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});


export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters') ,
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone must be less than 20 characters').regex(/^[0-9+\-() ]+$/, 'Invalid phone format'),
});

export const userIdSchema = z.object({
  id: z.number().positive('Invalid user ID'),
});

export const createHobbySchema = z.object({
  userId: z.number().positive('Invalid user ID'),
  hobby: z.string().min(1, 'Hobby is required').max(500, 'Hobby must be less than 500 characters'),
});

export const hobbyIdSchema = z.object({
  id: z.number().positive('Invalid hobby ID'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateHobbyInput = z.infer<typeof createHobbySchema>;