import { ResponseCode } from 'utils/contants'
import { createRes } from 'utils/index'
import { Middleware } from 'koa'
import { decodeToken, verify } from 'utils/jst'
import { withoutVerifyRoute } from '../config/index'

const verifyMiddleware: Middleware = async (ctx, next) => {
  const { url } = ctx
  if (withoutVerifyRoute.some((item) => (url as string).includes(item))) {
    await next()
  } else if (url.startsWith('/public')) {
    ctx.url = url.replace('/public', '')
    await next()
  } else {
    const key = ctx.request.headers.authorization
    const result = await verify(key)
    if (result === 'success') {
      const payload = await decodeToken(key!)
      ctx.state.jwtPayload = payload
      await next()
    } else if (result === 'timeout') {
      ctx.body = createRes(ResponseCode.TOKEN_OUT, null, 'token过期, 请重新登录')
    } else {
      ctx.body = createRes(ResponseCode.TOKEN_WRONG, null, 'token无效, 请重新登录')
    }
  }
}
export default verifyMiddleware
