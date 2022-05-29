import Router from '@koa/router'
import ShoppingCar from 'model/shopping_car'
import { RequestAddShoppingCar, RequestUpdateShoppingCarItemCount } from 'types/server'
import { createRes } from 'utils/index'
import { ResponseCode } from 'utils/contants'

const route = new Router({
  prefix: '/shoppingcar',
})

route.get('/list', async (ctx) => {
  const { uuid } = ctx.state.jwtPayload
  const result = await ShoppingCar.getAll(uuid)
  ctx.body = createRes(ResponseCode.SUCCESS, result, '')
})
route.post('/update', async (ctx) => {
  const { id, count } = ctx.request.body as RequestUpdateShoppingCarItemCount
  const result = await ShoppingCar.updateCount(id, count)
  if (result) {
    ctx.body = createRes(ResponseCode.SUCCESS, '', '')
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该商品不存在')
  }
})
route.post('/add', async (ctx) => {
  const { goodId, count } = ctx.request.body as RequestAddShoppingCar
  const { uuid } = ctx.state.jwtPayload
  await ShoppingCar.addGood(goodId, uuid, count)
  ctx.body = createRes(ResponseCode.SUCCESS, '', '')
})
route.post('/remove', async (ctx) => {
  const ids = ctx.request.body
  await ShoppingCar.removeGood(ids)
  ctx.body = createRes(ResponseCode.SUCCESS, '', '')
})
export default route
