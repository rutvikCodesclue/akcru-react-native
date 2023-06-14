import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
var morgan = require ('morgan');
import helmet from 'helmet';

import { createContext } from "./_context";
import { appRouter } from "./_router";

// EXPRESS
const app = express();
app.use(helmet()) // use helmet for security
app.use(morgan('combined')) // use morgan for logging

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
console.log('Server running on port 3000 (http://localhost:3000)');