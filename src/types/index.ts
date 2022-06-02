import { OrderStatus, PayMethod } from 'utils/contants'

export interface TableRecordBase {
  uuid: string
  createdAt: string
  updatedAt: string
}
export interface UserModel extends TableRecordBase {
  name: string
  account: string
  password: string
  avatar?: string
  desc: string
  integration: number
}
export interface UserAddressModel extends TableRecordBase {
  name: string
  tel: string
  province: string
  city: string
  county: string
  addressDetail: string
  areaCode: string
  isDefault: boolean
}
export interface ShoppingCarModel extends TableRecordBase {
  goodID: string
  count: number
}
export interface UserCollectionModel extends TableRecordBase {
  goodID: string
}
export interface SwipeImageModel extends TableRecordBase {
  imgURL: string
  goodID: string
}
export type GoodType = '水果' | '蔬菜'
export interface GoodModel extends TableRecordBase {
  title: string
  price: string
  sales: number
  goodType: GoodType
  type: string
  params: Record<string, string>
  goodSwiperImgs: string[]
  goodInfoImgs: string[]
  goodImg: string
}
export interface CommentModel extends TableRecordBase {
  goodID: string
  content: string
  userID: string
  userName: string
  avatar: string
  rate: number
}
export interface AddressModel extends TableRecordBase {
  name: string
  tel: string
  province: string
  city: string
  county: string
  addressDetail: string
  areaCode: string
  postalCode: string
  isDefault: boolean
  fromUserId?: string
}
export interface CouponModel extends TableRecordBase {
  name: string
  condition: number
  description?: string
  startAt: string
  endAt: string
  value: number
  valueDesc: string
  unitDesc: string
}
export interface UserCouponModel extends Omit<CouponModel, 'createdAt' | 'updatedAt'> {
  status: number
}
export interface OrderModel extends TableRecordBase {
  total: number
  status: OrderStatus
  leaveMessage: string
  payMethod: PayMethod
  fromUserId: string
  name: string
  addressDetail: string
  tel: string
  couponId: string
}
export interface OrderDetailModel extends TableRecordBase {
  price: number
  count: number
  goodId: string
}
