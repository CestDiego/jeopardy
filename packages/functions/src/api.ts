import { ApiError } from '@rukuma/core/errors.js'
import { logger } from '@rukuma/core/logger.js'
import { Hono } from 'hono'
import { logger as honoLogger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { Resource } from 'sst'
import { ZodError } from 'zod'

const app = new Hono()
app.use(honoLogger((message: string, ...rest: string[]) => logger.info(rest, message)))
app.use(prettyJSON())

app.onError((error, c) => {
  logger.error(error, 'An error occurred')

  if (error instanceof ZodError) {
    return c.json({ error: error.flatten() }, { status: 400 })
  }

  if (error instanceof ApiError) {
    return c.json({ error: error.message }, { status: error.statusCode })
  }

  return c.json({ error: 'Internal Server Error' }, { status: 500 })
})

app.get('/test', async (c) => {
  return c.json({ message: 'Hello, World!' })
})

app.put('/*', async (c) => {
  const key = crypto.randomUUID()
  await Resource.RukumaBucket.put(key, c.req.raw.body, {
    httpMetadata: {
      contentType: c.req.header('content-type'),
    },
  })
  return new Response(`Object created with key: ${key}`)
})

export default app
