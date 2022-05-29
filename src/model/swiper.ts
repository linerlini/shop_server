import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'
import { SwipeImageModel } from '../types/index'

class Swiper extends Model {
  static async getRecentRecords() {
    try {
      const result = await Swiper.findAll({
        limit: 5,
        order: [['updatedAt', 'DESc']],
      })
      return result.map<SwipeImageModel>((item) => item.get())
    } catch (err) {
      console.error(err)
      return []
    }
  }
}

Swiper.init(
  {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue() {
        return uuidv4()
      },
    },
    imgURL: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
  },
)
export default Swiper
