import Router from '@koa/router'
import Good, { formatGoodData } from 'model/good'
import { createRes } from 'utils/index'
import { ResponseCode } from 'utils/contants'
import { decodeToken, verify } from 'utils/jst'
import UserCollection from 'model/user_collection'
import { JWTPayload, RequestGoodDetail, RequestPage } from 'types/server'
import ShoppingCar from 'model/shopping_car'

const route = new Router({
  prefix: '/good',
})

route.post('/list', async (ctx) => {
  const result = await Good.getByPage(ctx.request.body as RequestPage)
  ctx.body = createRes(ResponseCode.SUCCESS, result, '')
})
route.get('/detail', async (ctx) => {
  const { id, login } = ctx.request.query as unknown as RequestGoodDetail
  let hasCollected = false
  let shoppingCarCount = 0
  if (login === '1') {
    const key = ctx.request.headers.authorization
    const result = await verify(key)
    if (result === 'success') {
      const { uuid } = await decodeToken(key!)
      hasCollected = await UserCollection.hasCollected(id, uuid)
      shoppingCarCount = await ShoppingCar.getCollectionCount(uuid, id)
    } else if (result === 'timeout') {
      ctx.body = createRes(ResponseCode.TOKEN_OUT, null, 'token过期')
      return
    } else {
      ctx.body = createRes(ResponseCode.TOKEN_WRONG, null, 'token无效')
      return
    }
  }
  const data = await Good.getById(id as string)
  if (data) {
    ctx.body = createRes(
      ResponseCode.SUCCESS,
      {
        goodDetail: formatGoodData(data),
        hasCollected,
        shoppingCarCount,
      },
      '',
    )
  } else {
    ctx.body = createRes(ResponseCode.NO_MATCH_ERROR, '', '该商品不存在')
  }
})
route.get('/collect/has', async (ctx) => {
  const { uuid } = ctx.state.jwtPayload as JWTPayload
  const { id } = ctx.request.query
  const hasCollected = await UserCollection.hasCollected(id as string, uuid)
  ctx.body = createRes(ResponseCode.SUCCESS, hasCollected, '')
})
route.get('/collect', async (ctx) => {
  const { id, collectedStr } = ctx.request.query
  const collected = collectedStr === '1'
  const { uuid } = ctx.state.jwtPayload
  await UserCollection.collect(uuid, id as string, collected)
  ctx.body = createRes(ResponseCode.SUCCESS, collected, '')
})
route.post('/collect/list', async (ctx) => {
  const { uuid } = ctx.state.jwtPayload
  const result = await UserCollection.getByPage(ctx.request.body as RequestPage, uuid)
  ctx.body = createRes(ResponseCode.SUCCESS, result, '')
})
export default route
