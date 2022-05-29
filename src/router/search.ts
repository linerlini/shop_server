import { ResponseCode } from 'utils/contants'
import { createRes } from 'utils/index'
import Router from '@koa/router'
import Good from 'model/good'
import SearchRecord from 'model/search_record'
import { RequestPage } from '../types/server'

const route = new Router({
  prefix: '/search',
})

route.post('/main', async (ctx) => {
  const data = ctx.request.body as RequestPage
  const { offset, searchText } = data
  if (offset === 0) {
    await SearchRecord.addSearchRecord(searchText)
  }
  const result = await Good.getByPage(data)
  ctx.body = createRes(ResponseCode.SUCCESS, result, '')
})
route.get('/associational', async (ctx) => {
  const { keyword } = ctx.request.query
  const result = await SearchRecord.getAssociationalWord(keyword as string)
  ctx.body = createRes(ResponseCode.SUCCESS, result, '')
})

export default route
