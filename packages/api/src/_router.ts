import { t } from './_trpc'

/* IMPORT SUB ROUTERS (FROM ./ROUTES HERE ⬇️ */


// MAIN ROUTER
export const appRouter = t.router({
    sayHi: t.procedure.query(() => {
        return 'hi'
    })
})