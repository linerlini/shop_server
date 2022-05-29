import { isDev } from 'utils/contants'
import { Options } from 'sequelize/types'

export const dbConfig: Options = {
  host: '1.14.74.191',
  port: 3306,
  dialect: 'mysql',
  database: isDev ? 'new_shop' : '',
  username: isDev ? 'new_shop' : '',
  password: 'testtest',
}

export const withoutVerifyRoute = [
  '/api/user/register',
  '/api/user/login',
  '/api/user/refresh',
  '/api/recommend/swipe',
  '/api/recommend/list',
  '/api/search/main',
  '/api/search/associational',
  '/api/good/detail',
  '/api/good/list',
  '/api/blog/info',
  '/api/blog/leavemessage',
]
