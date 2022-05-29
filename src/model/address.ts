import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'
import { ResponseCode } from 'utils/contants'
import HTTPError from 'utils/http_error'
import { UserAddressModel } from '../types/index'

class Address extends Model {
  static async getAll(id: string) {
    try {
      const result = await Address.findAll({
        where: {
          fromUserId: id,
        },
      })
      return result.map<UserAddressModel>((item) => item.get())
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器错误，请重试', 200)
    }
  }
}
Address.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue() {
        return uuidv4()
      },
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    tel: {
      type: DataTypes.STRING,
    },
    province: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    county: {
      type: DataTypes.STRING,
    },
    addressDetail: {
      type: DataTypes.STRING,
    },
    areaCode: {
      type: DataTypes.STRING,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
    },
  },
  { sequelize },
)
export default Address
