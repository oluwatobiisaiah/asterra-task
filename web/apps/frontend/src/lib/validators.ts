import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  address: z.string().min(1, 'Address is required'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .max(20, 'Phone must be less than 20 characters')
    .regex(/^[0-9+\-() ]+$/, 'Invalid phone format'),
});

export const createHobbySchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
  hobby: z
    .string()
    .min(1, 'Hobby is required')
    .max(500, 'Hobby must be less than 500 characters'),
});


export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type CreateHobbyFormData = z.infer<typeof createHobbySchema>;