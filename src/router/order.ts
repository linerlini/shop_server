import { ResponseCode } from 'utils/contants'
import { createRes } from 'utils/index'
import Router from '@koa/router'
import Order from 'model/order'
import ShoppingCar from 'model/shopping_car'
import UserCoupon from 'model/user_coupon'
import User from 'model/user'
import { RequestCreateOrder, RequestPage } from '../types/server'

const route = new Router({
  prefix: '/order',
})

route.post('/create', async (ctx) => {
  const data = ctx.request.body as RequestCreateOrder
  const { uuid } = ctx.state.jwtPayload
  const orderInstance = await Order.addOne(uuid, data)
  if (data.shoppingCarIds.length) {
    await ShoppingCar.removeGood(data.shoppingCarIds)
  }
  if (data.couponId) {
    await UserCoupon.useOne(uuid, data.couponId)
  }
  ctx.body = createRes(ResponseCode.SUCCESS, orderInstance.get(), '')
})
route.get('/detail', async (ctx) => {
  const { id } = ctx.request.query
  const result = await Order.getOne(id as string)
  ctx.body = createRes(ResponseCode.SUCCESS, result, '')
})
route.post('/list', async (ctx) => {
  const requestBody = ctx.request.body as RequestPage
  const { uuid } = ctx.state.jwtPayload
  const result = await Order.getByPage(uuid, requestBody)
  ctx.body = createRes(ResponseCode.SUCCESS, result, '')
})
route.get('/pay', async (ctx) => {
  const { id } = ctx.requset.query
  const { account } = ctx.state.jwtPayload
  const userInfo = await User.getUserByAccount(account)
  if (!userInfo) {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该用户不存在')
    return
  }
  const money = userInfo.getDataValue('integration')
  const result = await Order.pay(id, money)
  if (result.error) {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', result.msg)
  } else {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  }
})
route.get('/send', async (ctx) => {
  const { id } = ctx.requset.query

  const result = await Order.sendGood(id)
  if (result) {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该订单不存在')
  }
})
export default route
