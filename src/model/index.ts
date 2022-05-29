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

Address.belongsTo(User, { targetKey: 'uuid', foreignKey: 'fromUserId' })

Comment.belongsTo(Good, { targetKey: 'uuid', foreignKey: 'goodId' })
Comment.belongsTo(User, { targetKey: 'uuid', foreignKey: 'fromUserId' })

OrderDetail.belongsTo(Order, { targetKey: 'uuid', foreignKey: 'orderId' })
OrderDetail.belongsTo(Good, { targetKey: 'uuid', foreignKey: 'goodId' })

Order.belongsTo(Address, { targetKey: 'uuid', foreignKey: 'addressId' })
Order.belongsTo(User, { targetKey: 'uuid', foreignKey: 'fromUserId' })

ShoppingCar.belongsTo(Good, { targetKey: 'uuid', foreignKey: 'goodId' })
ShoppingCar.belongsTo(User, { targetKey: 'uuid', foreignKey: 'fromUserId' })

UserCollection.belongsTo(User, { targetKey: 'uuid', foreignKey: 'fromUserId' })
UserCollection.belongsTo(Good, { targetKey: 'uuid', foreignKey: 'goodId' })

Swiper.belongsTo(Good, { targetKey: 'uuid', foreignKey: 'goodId' })

Good.hasMany(Comment, { foreignKey: 'goodId' })
Good.hasMany(OrderDetail, { foreignKey: 'goodId' })
Good.hasMany(ShoppingCar, { foreignKey: 'goodId' })
Good.hasMany(UserCollection, { foreignKey: 'goodId' })
Good.hasMany(Swiper, { foreignKey: 'goodId' })
Order.hasMany(OrderDetail, { foreignKey: 'orderId' })
Address.hasMany(Order, { foreignKey: 'addressId' })
User.hasMany(UserCollection, { foreignKey: 'fromUserId' })
User.hasMany(Address, { foreignKey: 'fromUserId' })
User.hasMany(Order, { foreignKey: 'fromUserId' })
User.hasMany(ShoppingCar, { foreignKey: 'fromUserId' })
User.hasMany(Comment, { foreignKey: 'fromUserId' })

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
