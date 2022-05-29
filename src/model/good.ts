import { Model, DataTypes, WhereOptions, Op } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'
import { RequestPage } from 'types/server'
import HTTPError from 'utils/http_error'
import { ResponseCode } from 'utils/contants'
import { GoodModel } from '../types/index'

function parseParams(params: string): Record<string, string> {
  const parseData = JSON.parse(params)
  return parseData
}
function parseImgs(str: string): string[] {
  const parseData = JSON.parse(str)
  return parseData
}
export function formatGoodData(goodRecord: any) {
  const parseData = goodRecord.get()
  parseData.params = parseParams(parseData.params)
  parseData.goodSwiperImgs = parseImgs(parseData.goodSwiperImgs)
  parseData.goodInfoImgs = parseImgs(parseData.goodInfoImgs)
  return parseData as GoodModel
}
class Good extends Model {
  static async getByPage(params: RequestPage) {
    try {
      const { offset = 0, size = 20, searchText, type, goodType } = params
      const whereRule: WhereOptions | undefined = {}
      if (searchText) {
        whereRule.title = {
          [Op.like]: `%${searchText}%`,
        }
      }
      if (type) {
        whereRule.type = type
      }
      if (goodType) {
        whereRule.goodType = goodType
      }
      const result = await Good.findAndCountAll({
        order: [['sales', 'DESC']],
        offset,
        limit: size,
        where: whereRule,
      })
      const data = result.rows.map<GoodModel>(formatGoodData)
      return {
        count: result.count,
        data,
      }
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '数据库查询失败', 200)
    }
  }

  static async getById(id: string) {
    try {
      const result = await Good.findOne({
        where: {
          uuid: id,
        },
      })
      return result
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常，请重试', 200)
    }
  }
}

Good.init(
  {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue() {
        return uuidv4()
      },
    },
    title: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.DOUBLE,
    },
    sales: {
      type: DataTypes.INTEGER,
      defaultValue() {
        return 0
      },
    },
    goodType: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    params: {
      type: DataTypes.STRING,
    },
    goodSwiperImgs: {
      type: DataTypes.TEXT,
    },
    goodInfoImgs: {
      type: DataTypes.TEXT,
    },
    goodImg: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
  },
)

export default Good
