import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'

class Order extends Model {}

Order.init(
  {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue() {
        return uuidv4()
      },
    },
    total: {
      type: DataTypes.DOUBLE,
    },
    status: {
      type: DataTypes.INTEGER,
    },
    leaveMessage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payMethod: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
  },
)

export default Order
