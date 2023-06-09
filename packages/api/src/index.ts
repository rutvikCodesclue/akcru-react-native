import express from 'express';
import { initTRPC, inferAsyncReturnType } from "@trpc/server" 
import * as trpcExpress from '@trpc/server/adapters/express';

// CONTEXT: created for each request
type Context = inferAsyncReturnType<typeof createContext>;
const createContext = ({
    // req,
    // res,
}: trpcExpress.CreateExpressContextOptions) => ({ }); // no context

// TRPC (T INSTANCE)
const t = initTRPC.context<Context>().create();

// ROUTER
const appRouter = t.router({
    sayHi: t.procedure.query(() => {
        return 'hi'
    })
})

const app = express();

// USE TRPC
app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        createContext, // CONTEXT
        router: appRouter, // ROUTER
    }),
);


app.listen(3000);

console.log('Server running on port 3000');