import { initTRPC, TRPCError } from '@trpc/server';
import { dbService } from '../services/database.service';
import {
  createUserSchema,
  createHobbySchema,
  userIdSchema,
  hobbyIdSchema,
  paginationSchema,
} from '../lib/validators';
import SuperJSON from 'superjson';
import { rateLimiters } from '../middleware/rateLimiter';

type Context = {
  ip: string;
};

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON
});

export const router = t.router;
export const publicProcedure = t.procedure;

const strictProcedure = publicProcedure.use(async ({ ctx, next }) => {
  rateLimiters.strict(ctx.ip); 
  return next();
});

const normalProcedure = publicProcedure.use(async ({ ctx, next }) => {
  rateLimiters.normal(ctx.ip); 
  return next();
});

const lenientProcedure = publicProcedure.use(async ({ ctx, next }) => {
  rateLimiters.lenient(ctx.ip);
  return next();
});

export const appRouter = router({
  user: router({
    create: strictProcedure.input(createUserSchema).mutation(async ({ input }) => {
      const existingUser = await dbService.getUserByPhone(input.phone);
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this phone number already exists',
        });
      }
      try {
        return await dbService.createUser(input);
      } catch (error: any) {
        console.error('Error creating user:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }
    }),

    getAll: lenientProcedure.query(async () => {
      try {
        return await dbService.getAllUsers();
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        });
      }
    }),

    getById: lenientProcedure.input(userIdSchema).query(async ({ input }) => {
      try {
        const user = await dbService.getUserById(input.id);
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
        return user;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error fetching user:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user',
        });
      }
    }),

    delete: strictProcedure.input(userIdSchema).mutation(async ({ input }) => {
      try {
        const deleted = await dbService.deleteUser(input.id);
        if (!deleted) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error deleting user:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user',
        });
      }
    }),
  }),

  hobby: router({
    create: strictProcedure.input(createHobbySchema).mutation(async ({ input }) => {
      try {
        const user = await dbService.getUserById(input.userId);
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
        return await dbService.createHobby(input);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error creating hobby:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create hobby',
        });
      }
    }),

    getByUserId: lenientProcedure.input(userIdSchema).query(async ({ input }) => {
      try {
        return await dbService.getHobbiesByUserId(input.id);
      } catch (error) {
        console.error('Error fetching hobbies:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch hobbies',
        });
      }
    }),

    delete: strictProcedure.input(hobbyIdSchema).mutation(async ({ input }) => {
      try {
        const deleted = await dbService.deleteHobby(input.id);
        if (!deleted) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Hobby not found',
          });
        }
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error deleting hobby:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete hobby',
        });
      }
    }),
  }),

  data: router({
    getUsersWithHobbies: normalProcedure
      .input(paginationSchema.optional())
      .query(async ({ input }) => {
        try {
          if (input) {
            return await dbService.getUsersWithHobbiesPaginated(input.page, input.limit);
          }
          // Return all data if no pagination params
          const data = await dbService.getUsersWithHobbies();
          return { data, pagination: null };
        } catch (error) {
          console.error('Error fetching users with hobbies:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch data',
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;