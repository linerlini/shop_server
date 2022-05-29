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
