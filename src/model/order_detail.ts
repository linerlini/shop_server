import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'
import { OrderDetailModel } from 'types/index'

class OrderDetail extends Model {
  static async addMany(goods: Partial<OrderDetailModel>[], orderId: string) {
    const goodRecords = goods.map((item) => {
      return OrderDetail.create({
        ...item,
        orderId,
      })
    })
    return Promise.all(goodRecords)
  }
}
OrderDetail.init(
  {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue() {
        return uuidv4()
      },
    },
    count: {
      type: DataTypes.INTEGER,
    },
    price: {
      type: DataTypes.DOUBLE,
    },
  },
  {
    sequelize,
  },
)

export default OrderDetail
