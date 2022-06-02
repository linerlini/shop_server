import Router from '@koa/router'
import userRoute from './user'
import recommendRoute from './recommend'
import searchRoute from './search'
import goodRoute from './good'
import shopingCarRoute from './shopping_car'
import orderRoute from './order'

const mainRouter = new Router({
  prefix: '/api',
})
mainRouter.use(userRoute.routes())
mainRouter.use(recommendRoute.routes())
mainRouter.use(searchRoute.routes())
mainRouter.use(goodRoute.routes())
mainRouter.use(shopingCarRoute.routes())
mainRouter.use(orderRoute.routes())
export default mainRouter
