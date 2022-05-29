import { Model, DataTypes, Op } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'
import { ResponseCode } from 'utils/contants'
import HTTPError from 'utils/http_error'

class SearchRecord extends Model {
  static async getAssociationalWord(keyword: string) {
    try {
      const result = await SearchRecord.findAll({
        where: {
          searchText: {
            [Op.like]: `%${keyword}%`,
          },
        },
        limit: 20,
        order: [['searchCount', 'DESC']],
      })
      return result.map<string>((item) => {
        const data = item.get()
        return data.searchText
      })
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '数据库查询失败', 200)
    }
  }

  static async addSearchRecord(keyword: string) {
    const record = await SearchRecord.findOne({
      where: {
        searchText: keyword,
      },
    })
    if (record) {
      await record.increment('searchCount')
    } else {
      await SearchRecord.create({ searchText: keyword, searchCount: 1 })
    }
  }
}

SearchRecord.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue() {
        return uuidv4()
      },
      primaryKey: true,
    },
    searchText: {
      type: DataTypes.STRING,
    },
    searchCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  { sequelize },
)

export default SearchRecord
