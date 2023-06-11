import { initTRPC, TRPCError } from "@trpc/server" 
import { Context } from "./_context";

export const t = initTRPC.context<Context>().create();

export const middleware = t.middleware;

// ROUTER
// export const router = t.router;

/**
 * Unprotected procedure
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure
 */
// export const protectedProcedure = t.procedure.use(isAuthed);