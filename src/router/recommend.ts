import { ResponseCode } from 'utils/contants'
import { createRes } from 'utils/index'
import Router from '@koa/router'
import Good from 'model/good'
import { RequestPage } from '../types/server'
import { swipeStore } from '../store/index'

const route = new Router({
  prefix: '/recommend',
})

route.get('/swipe', async (ctx) => {
  const result = await swipeStore.getData()
  ctx.body = createRes(ResponseCode.SUCCESS, result || [], '')
})
route.post('/list', async (ctx) => {
  const data = ctx.request.body as RequestPage
  const result = await Good.getByPage(data)
  ctx.body = createRes(ResponseCode.SUCCESS, result, '')
})
export default route
