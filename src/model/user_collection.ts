import { v4 as uuidv4 } from 'uuid'
import { ResponseCode } from 'utils/contants'
import { Model, DataTypes, WhereOptions } from 'sequelize'
import sequelize from 'controller/db'
import HTTPError from 'utils/http_error'
import { RequestPage } from 'types/server'
import Good from './good'
// import { UserCollectionModel } from 'types/index'

class UserCollection extends Model {
  static async hasCollected(goodId: string, userId: string) {
    try {
      const result = await UserCollection.findOne({
        where: {
          goodId,
          fromUserId: userId,
        },
      })
      return !!result
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器错误，请重试', 200)
    }
  }

  static async collect(userId: string, goodId: string, collected: boolean) {
    try {
      const target = await UserCollection.findOne({
        where: {
          goodId,
          fromUserId: userId,
        },
      })
      // 收藏
      if (collected && !target) {
        await UserCollection.create({
          goodId,
          fromUserId: userId,
        })
      }
      // 取消收藏
      if (!collected && target) {
        await target.destroy()
      }
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器错误，请重试', 200)
    }
  }

  static async getByPage(params: RequestPage, userId: string) {
    try {
      const { offset = 0, size = 20 } = params
      const whereRule: WhereOptions = {
        fromUserId: userId,
      }

      const result = await UserCollection.findAndCountAll({
        order: [['createdAt', 'DESC']],
        offset,
        limit: size,
        where: whereRule,
        include: [
          {
            model: Good,
            attributes: ['title', 'price', 'goodType', 'type', 'goodImg'],
          },
        ],
      })
      const formatData = result.rows.map((item) => {
        const formatItem = item.get()
        formatItem.goodInfo = formatItem.Good.get()
        delete formatItem.Good
        return formatItem
      })
      return {
        count: result.count,
        data: formatData,
      }
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '数据库查询失败', 200)
    }
  }
}
UserCollection.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue() {
        return uuidv4()
      },
      primaryKey: true,
    },
  },
  { sequelize },
)

export default UserCollection
