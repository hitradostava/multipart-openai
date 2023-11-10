import {createNextAuthMiddleware} from "nextjs-basic-auth-middleware"

const options = {
  users: [{name: "user", password: process.env.PASSWORD}],
}

export const middleware = createNextAuthMiddleware(options)

export const config = {
  matcher: ["/(.*)"],
}
