/* eslint-disable no-unused-vars */
// todo 解决eslint问题去掉上行注释
export const enum ENV {
  DEV = 'development',
  PRO = 'production',
}
export const isDev = process.env.NODE_ENV === ENV.DEV
export const enum ResponseCode {
  SUCCESS = 0,
  LENGTH_ERROR = 1, // 值长度不符合要求
  REPEAT_ERROR = 2, // 值重复
  LACK_OF_ERROR = 3, // 少值
  NO_MATCH_ERROR = 4, // 值不匹配
  RESPONSE_ERROR = 999, // 请求在响应时错误
  REQUEST_ERROR = 998, // 请求在前端出出错
  TOKEN_OUT = 997, // jwt过期
  TOKEN_WRONG = 996,
  NETWORK_ERROR = 995, // 网络问题
  DATABASE_ERROR = 994,
  FILE_UP_ERROR = 993,
}
