import { Middleware } from 'koa'
import { createRes } from 'utils/index'
import HttpError from 'utils/http_error'

const globalErrorHandle: Middleware = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    // todo err类型检测失败？
    if (err instanceof HttpError) {
      ctx.status = err.httpStatus
      ctx.body = createRes(err.code, null, err.msg)
    } else {
      console.error(err)
      ctx.throw(500, '服务器异常')
    }
  }
}
export default globalErrorHandle
