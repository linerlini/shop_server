import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'

class Comment extends Model {}

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
