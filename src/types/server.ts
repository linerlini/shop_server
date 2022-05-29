import { UserModel } from '.'

export interface ResponseData<T> {
  code: number
  data: T
  msg: string
}
export type JWTPayload = Omit<UserModel, 'password' | 'avatar' | 'desc' | 'integration' | 'createdAt' | 'updatedAt'>

// 请求
export interface RequestPage {
  offset: number
  size: number
  searchText: string
  type?: string
  goodType?: string
}
export interface RequestRegisterBody {
  password: string
  account: string
  userName: string
}
export interface RequestLoginBody {
  password: string
  account: string
}
export interface RequestGoodDetail {
  id: string
  login: string
}
export interface RequestUpdateShoppingCarItemCount {
  id: string
  action: 'up' | 'down'
  count: number
}
export interface RequestAddShoppingCar {
  goodId: string
  count: number
}