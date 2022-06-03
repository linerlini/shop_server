import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'
import { RequestComment } from 'types/server'

class Comment extends Model {
  static async addMany(params: RequestComment, userId: string) {
    const { goodIds, comment, rate } = params
    const commentRecordP = goodIds.map((item) => {
      const result = Comment.create({
        content: comment,
        rate,
        goodId: item,
        fromUserId: userId,
      })
      return result
    })
    return Promise.all(commentRecordP)
  }
}

Comment.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue() {
        return uuidv4()
      },
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING,
    },
    rate: {
      type: DataTypes.INTEGER,
    },
  },
  { sequelize },
)

export default Comment
