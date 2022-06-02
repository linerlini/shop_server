import sequelize from 'controller/db'
import { Model, DataTypes } from 'sequelize'
import { v4 as uuidV4 } from 'uuid'

class Coupon extends Model {}
Coupon.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue() {
        return uuidV4()
      },
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    condition: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startAt: {
      type: DataTypes.DATE,
    },
    endAt: {
      type: DataTypes.DATE,
    },
    value: {
      type: DataTypes.DOUBLE,
    },
    valueDesc: {
      type: DataTypes.STRING,
    },
    unitDesc: {
      type: DataTypes.STRING,
    },
  },
  { sequelize },
)

export default Coupon
