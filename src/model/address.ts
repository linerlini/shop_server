import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'
import { ResponseCode } from 'utils/contants'
import HTTPError from 'utils/http_error'
import { partialObj } from 'utils/index'
import { AddressModel, UserAddressModel } from '../types/index'

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

  static async addOne(userId: string, addressInfo: AddressModel) {
    try {
      const { isDefault } = addressInfo
      if (isDefault) {
        const oldDefaultAddress = await Address.findOne({
          where: {
            isDefault: true,
            fromUserId: userId,
          },
        })
        if (oldDefaultAddress) {
          oldDefaultAddress.set('isDefault', false)
          await oldDefaultAddress.save()
        }
      }
      const result = await Address.create({
        fromUserId: userId,
        ...partialObj(addressInfo, ['name', 'tel', 'province', 'city', 'county', 'addressDetail', 'areaCode', 'isDefault']),
      })
      return result
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '添加失败，请重试', 200)
    }
  }

  static async editOne(userId: string, addressId: string, addressInfo: Partial<AddressModel>) {
    try {
      const result = await Address.findOne({
        where: {
          uuid: addressId,
          fromUserId: userId,
        },
      })
      if (result) {
        const needData = partialObj(addressInfo, ['name', 'tel', 'province', 'city', 'county', 'addressDetail', 'areaCode', 'isDefault'])
        if (result.getDataValue('isDefault') !== needData.isDefault && needData.isDefault) {
          const oldDefaultAddress = await Address.findOne({
            where: {
              fromUserId: userId,
              isDefault: true,
            },
          })
          oldDefaultAddress?.set('isDefault', false)
          await oldDefaultAddress?.save()
        }
        ;(Object.keys(needData) as Array<keyof AddressModel>).forEach((key: keyof AddressModel) => {
          result.set(key, addressInfo[key])
        })
        await result.save()
        return true
      }
      return false
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '添加失败，请重试', 200)
    }
  }

  static async deleteOne(addressId: string, userId: string) {
    try {
      await Address.destroy({
        where: {
          uuid: addressId,
          fromUserId: userId,
        },
      })
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常，请重试', 200)
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
