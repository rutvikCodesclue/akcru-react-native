import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';

import { createContext } from "./_context";
import { appRouter } from "./_router";
var morgan = require ('morgan');


// EXPRESS
const app = express();
app.use(morgan('combined'))

// MIDDLEWARE: USE TRPC
app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        createContext, // CONTEXT
        router: appRouter, // ROUTER
    }),
);

// RUN THE SERVER w/ some logs
app.listen(3000);
console.log('Server running on port 3000');