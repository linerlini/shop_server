import { Model, DataTypes, Op } from 'sequelize'
import sequelize from 'controller/db'
import { v4 as uuidv4 } from 'uuid'
import HTTPError from 'utils/http_error'
import { ResponseCode } from 'utils/contants'
import Good from './good'

class ShoppingCar extends Model {
  static async getCollectionCount(userId: string, goodId: string): Promise<number> {
    try {
      const result = await ShoppingCar.findOne({
        where: {
          goodId,
          fromUserId: userId,
        },
      })
      return result ? result.getDataValue('count') : 0
    } catch (err) {
      console.error(err)
      return 0
    }
  }

  static async getAll(userId: string) {
    try {
      const result = await ShoppingCar.findAll({
        where: {
          fromUserId: userId,
        },
        include: {
          model: Good,
        },
        order: [['updatedAt', 'DESC']],
      })
      return result.map((item: any) => {
        const formatItem = { ...item.get() }
        const goodData = item.Good.get()
        formatItem.goodDetail = {
          title: goodData.title,
          price: goodData.price,
          imgURL: goodData.goodImg,
          type: goodData.type,
          goodType: goodData.goodType,
        }
        delete formatItem.Good
        return formatItem
      })
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常，请重试', 200)
    }
  }

  static async updateCount(id: string, count: number) {
    try {
      const result = await ShoppingCar.findOne({
        where: {
          uuid: id,
        },
      })
      if (!result) {
        return false
      }
      result.setDataValue('count', count)
      await result.save()
      return true
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常，请重试', 200)
    }
  }

  static async addGood(goodId: string, userId: string, count: number) {
    try {
      const result = await ShoppingCar.findOne({
        where: {
          fromUserId: userId,
          goodId,
        },
      })
      if (result) {
        await result.increment('count', { by: count })
      } else {
        await ShoppingCar.create({
          count,
          goodId,
          fromUserId: userId,
        })
      }
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常，请重试', 200)
    }
  }

  static async removeGood(ids: string[]) {
    try {
      await ShoppingCar.destroy({
        where: {
          uuid: {
            [Op.in]: ids,
          },
        },
      })
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常，请重试', 200)
    }
  }
}

ShoppingCar.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue() {
        return uuidv4()
      },
      primaryKey: true,
    },
    count: {
      type: DataTypes.INTEGER,
    },
  },
  { sequelize },
)

export default ShoppingCar
