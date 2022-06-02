import Router from '@koa/router'
import User from 'model/user'
import { JWTPayload, RequestEditAddress, RequestLoginBody, RequestRegisterBody } from 'types/server'
import { createRes, saveFile } from 'utils/index'
import { ResponseCode } from 'utils/contants'
import HTTPError from 'utils/http_error'
import { sign } from 'utils/jst'
import Address from 'model/address'
import UserCoupon from 'model/user_coupon'

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
      coupons: [],
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
      const coupons = await UserCoupon.getAll(user.uuid)
      ctx.body = createRes(
        ResponseCode.SUCCESS,
        {
          userInfo: {
            ...user,
            password: '',
          },
          coupons,
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
    const coupons = await UserCoupon.getAll(userInfo.uuid)
    userInfo.password = ''
    ctx.body = createRes(ResponseCode.SUCCESS, { userInfo, coupons }, '')
  } else {
    ctx.body = createRes(ResponseCode.LACK_OF_ERROR, null, '请重新登录')
  }
})

// 用户地址
userRoute.get('/address/list', async (ctx) => {
  const { uuid } = ctx.state.jwtPayload
  const result = await Address.getAll(uuid)
  ctx.body = createRes(ResponseCode.SUCCESS, result, '')
})
userRoute.post('/address/edit', async (ctx) => {
  const { uuid } = ctx.state.jwtPayload
  const { addressData, actionType, addressId } = ctx.request.body as RequestEditAddress
  if (actionType === 'add') {
    const result = await Address.addOne(uuid, addressData)
    ctx.body = createRes(ResponseCode.SUCCESS, result.getDataValue('uuid'), '')
  } else {
    const result = await Address.editOne(uuid, addressId || '', addressData)
    if (result) {
      ctx.body = createRes(ResponseCode.SUCCESS, '', '')
    } else {
      ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '不存在该地址，无法修改')
    }
  }
})
userRoute.get('/address/delete', async (ctx) => {
  const { id } = ctx.request.query
  const { uuid } = ctx.state.jwtPayload
  await Address.deleteOne(id as string, uuid)
  ctx.body = createRes(ResponseCode.SUCCESS, '', '')
})
// 优惠卷
userRoute.get('/coupon/add', async (ctx) => {
  const { id } = ctx.request.query
  const { uuid } = ctx.state.jwtPayload
  const result = await UserCoupon.addOne(uuid, id as string)
  if (result.status) {
    ctx.body = createRes(ResponseCode.SUCCESS, result.data, '')
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', result.msg)
  }
})
// 个人资料
userRoute.post('/edit', async (ctx) => {
  const { name, desc } = ctx.request.body
  const { account } = ctx.state.jwtPayload
  const { files } = ctx.request

  if (!files || !files.avatar) {
    ctx.body = createRes(ResponseCode.LACK_OF_ERROR, '', '未上传头像')
    return
  }
  const { avatar } = files
  const imgURL = await saveFile(avatar)
  const result = await User.updateUser(account, {
    name,
    desc,
    avatar: imgURL,
  })
  if (result) {
    ctx.body = createRes(
      ResponseCode.SUCCESS,
      {
        avatar: imgURL,
      },
      '',
    )
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '不存在该账号')
  }
})
export default userRoute
