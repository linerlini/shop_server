import { ResponseCode } from 'utils/contants'
import { createRes } from 'utils/index'
import Router from '@koa/router'
import Order from 'model/order'
import ShoppingCar from 'model/shopping_car'
import UserCoupon from 'model/user_coupon'
import User from 'model/user'
import Comment from 'model/comment'
import { JWTPayload, RequestComment, RequestCreateOrder, RequestPage, RequestPay, RequestRefund } from '../types/server'

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
  if (!result) {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '不存在该订单')
  } else {
    ctx.body = createRes(ResponseCode.SUCCESS, result, '')
  }
})
route.post('/list', async (ctx) => {
  const requestBody = ctx.request.body as RequestPage
  const { uuid } = ctx.state.jwtPayload
  const result = await Order.getByPage(uuid, requestBody)
  ctx.body = createRes(ResponseCode.SUCCESS, result, '')
})
route.post('/pay', async (ctx) => {
  const { id, address } = ctx.request.body as RequestPay
  const { account } = ctx.state.jwtPayload
  const userInfo = await User.getUserByAccount(account)
  if (!userInfo) {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该用户不存在')
    return
  }
  const money = userInfo.getDataValue('integration')
  const result = await Order.pay(id, money, address)
  if (result.error) {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', result.msg)
  } else {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  }
})
route.get('/send', async (ctx) => {
  const { id } = ctx.request.query

  const result = await Order.sendGood(id as string)
  if (result) {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该订单不存在')
  }
})
route.get('/receive', async (ctx) => {
  const { id } = ctx.request.query

  const result = await Order.receiveGood(id as string)
  if (result) {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该订单不存在')
  }
})
route.get('/cancel', async (ctx) => {
  const { id } = ctx.request.query
  const { uuid } = ctx.state.jwtPayload as JWTPayload
  const result = await Order.cancelOrder(id as string, uuid)
  if (result) {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该订单不存在')
  }
})
route.post('/comment', async (ctx) => {
  const { uuid } = ctx.state.jwtPayload as JWTPayload
  const requestBody = ctx.request.body as RequestComment
  await Comment.addMany(requestBody, uuid)
  const result = await Order.success(requestBody.orderId)
  if (result) {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该订单不存在')
  }
})
route.post('/refund', async (ctx) => {
  const requestBody = ctx.request.body as RequestRefund

  const result = await Order.refund(requestBody.orderId, requestBody.refundMessage)
  if (result) {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该订单不存在')
  }
})
route.get('/refund/cancel', async (ctx) => {
  const { id } = ctx.request.query
  const result = await Order.refundCancel(id as string)
  if (result) {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该订单不存在')
  }
})
route.get('/refund/sucess', async (ctx) => {
  const { id } = ctx.request.query

  const result = await Order.refundSuccess(id as string)
  if (result) {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该订单不存在')
  }
})
export default route
