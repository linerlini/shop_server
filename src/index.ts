import { resolve } from 'path'
import Koa from 'koa'
import bodyParser from 'koa-body'
import globalErrorHandle from 'middleware/catch_error'
import verifyMiddleware from 'middleware/verify'
import staticServer from 'koa-static'
import 'model/index'
import mainRouter from './router'

const server = new Koa()
server.use(globalErrorHandle)
server.use(
  bodyParser({
    multipart: true,
    formidable: {
      keepExtensions: true,
    },
  }),
)
server.use(verifyMiddleware)
server.use(
  staticServer(resolve(__dirname, '..', 'static'), {
    gzip: true,
    maxAge: 1000 * 60 * 60,
  }),
)
server.use(mainRouter.routes())
server.use(mainRouter.allowedMethods())

server.listen(4000)
