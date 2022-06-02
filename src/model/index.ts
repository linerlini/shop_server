import Good from './good'
import Comment from './comment'
import Address from './address'
import OrderDetail from './order_detail'
import Order from './order'
import SearchRecord from './search_record'
import ShoppingCar from './shopping_car'
import Swiper from './swiper'
import UserCollection from './user_collection'
import User from './user'
import Coupon from './coupon'
import UserCoupon from './user_coupon'

Address.belongsTo(User, { targetKey: 'uuid', foreignKey: 'fromUserId' })

Comment.belongsTo(Good, { targetKey: 'uuid', foreignKey: 'goodId' })
Comment.belongsTo(User, { targetKey: 'uuid', foreignKey: 'fromUserId' })

OrderDetail.belongsTo(Order, { targetKey: 'uuid', foreignKey: 'orderId' })
OrderDetail.belongsTo(Good, { targetKey: 'uuid', foreignKey: 'goodId' })

Order.belongsTo(User, { targetKey: 'uuid', foreignKey: 'fromUserId' })
Order.belongsTo(Coupon, { targetKey: 'uuid', foreignKey: 'couponId' })

ShoppingCar.belongsTo(Good, { targetKey: 'uuid', foreignKey: 'goodId' })
ShoppingCar.belongsTo(User, { targetKey: 'uuid', foreignKey: 'fromUserId' })

UserCollection.belongsTo(User, { targetKey: 'uuid', foreignKey: 'fromUserId' })
UserCollection.belongsTo(Good, { targetKey: 'uuid', foreignKey: 'goodId' })

Swiper.belongsTo(Good, { targetKey: 'uuid', foreignKey: 'goodId' })

UserCoupon.belongsTo(User, { targetKey: 'uuid', foreignKey: 'userId' })
UserCoupon.belongsTo(Coupon, { targetKey: 'uuid', foreignKey: 'couponId' })

Good.hasMany(Comment, { foreignKey: 'goodId' })
Good.hasMany(OrderDetail, { foreignKey: 'goodId' })
Good.hasMany(ShoppingCar, { foreignKey: 'goodId' })
Good.hasMany(UserCollection, { foreignKey: 'goodId' })
Good.hasMany(Swiper, { foreignKey: 'goodId' })
Order.hasMany(OrderDetail, { foreignKey: 'orderId' })
User.hasMany(UserCollection, { foreignKey: 'fromUserId' })
User.hasMany(Address, { foreignKey: 'fromUserId' })
User.hasMany(Order, { foreignKey: 'fromUserId' })
User.hasMany(ShoppingCar, { foreignKey: 'fromUserId' })
User.hasMany(Comment, { foreignKey: 'fromUserId' })
User.hasMany(UserCoupon, { foreignKey: 'userId' })
Coupon.hasMany(Order, { foreignKey: 'couponId' })
Coupon.hasMany(UserCoupon, { foreignKey: 'couponId' })

Good.sync({ alter: false })
Comment.sync({ alter: false })
Address.sync({ alter: false })
Order.sync({ alter: false })
OrderDetail.sync({ alter: false })
SearchRecord.sync({ alter: false })
ShoppingCar.sync({ alter: false })
Swiper.sync({ alter: false })
UserCollection.sync({ alter: false })
User.sync({ alter: false })
Coupon.sync({ alter: false })
UserCoupon.sync({ alter: false })
