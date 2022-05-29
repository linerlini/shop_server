export default class HTTPError extends Error {
  /**
   * http 状态码
   */
  public httpStatus: number = 500

  /**
   * 返回的信息内容
   */
  public msg: string = '服务器未知错误'

  public code: number = 0

  constructor(code: number, msg: string, httpStatus: number = 200) {
    super()
    this.msg = msg
    this.code = code
    this.httpStatus = httpStatus
  }
}
