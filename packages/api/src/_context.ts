import { inferAsyncReturnType } from "@trpc/server" 
import * as trpcExpress from '@trpc/server/adapters/express';

// CONTEXT: created for each request
export const createContext = ({
    // req,
    // res,
}: trpcExpress.CreateExpressContextOptions) => ({ }); // no context
export type Context = inferAsyncReturnType<typeof createContext>;