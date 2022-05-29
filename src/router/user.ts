import Router from '@koa/router'
import User from 'model/user'
import { JWTPayload, RequestLoginBody, RequestRegisterBody } from 'types/server'
import { createRes } from 'utils/index'
import { ResponseCode } from 'utils/contants'
import HTTPError from 'utils/http_error'
import { sign } from 'utils/jst'

const userRoute = new Router({ prefix: '/user' })
// 用户注册
userRoute.post('/register', async (ctx) => {
  const { account, password, userName } = <RequestRegisterBody>ctx.request.body || {}
  if (!account || !password || !userName) {
    throw new HTTPError(ResponseCode.LACK_OF_ERROR, '缺少参数', 200)
  }
  const result = await User.createNewUser(account, password, userName)
  const token = await sign({
    account,
    name: userName,
    uuid: result.uuid,
  })
  ctx.body = createRes(
    ResponseCode.SUCCESS,
    {
      userInfo: {
        ...result,
        password: '',
      },
      token,
    },
    '注册成功',
  )
})
// 用户登录
userRoute.post('/login', async (ctx) => {
  const { account, password } = <RequestLoginBody>ctx.request.body
  const userR = await User.getUserByAccount(account)
  const user = userR?.get()
  if (user) {
    const truePassword = user.password
    if (truePassword === password) {
      const token = await sign({ account, name: user.name, uuid: user.uuid })
      ctx.body = createRes(
        ResponseCode.SUCCESS,
        {
          userInfo: {
            ...user,
            password: '',
          },
          token,
        },
        '登录成功',
      )
    } else {
      ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, null, '账户与密码不符')
    }
  } else {
    ctx.body = createRes(ResponseCode.LACK_OF_ERROR, null, '该账号不存在')
  }
})
// 退出登录
userRoute.get('/logout', async (ctx) => {
  ctx.cookies.set('token', '', {
    overwrite: true,
  })
})
// 自动登录
userRoute.get('/auto', async (ctx) => {
  const { account } = ctx.state.jwtPayload as JWTPayload
  const userR = await User.getUserByAccount(account)
  const userInfo = userR?.get()
  if (userInfo) {
    ctx.body = createRes(ResponseCode.SUCCESS, { ...userInfo, password: '' }, '')
  } else {
    ctx.body = createRes(ResponseCode.LACK_OF_ERROR, null, '请重新登录')
  }
})

export default userRoute
