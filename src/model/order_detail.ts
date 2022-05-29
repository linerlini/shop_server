import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'

class OrderDetail extends Model {}
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
