import { Model, DataTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'
import HTTPError from 'utils/http_error'
import { ResponseCode } from 'utils/contants'
import { UserModel } from '../types/index'

const USER_NAME_MAX_LENGTH = 16
const ACCOUNT_MAX_LENGTH = 32
const PASSWORD_MAX_LENGTH = 64
const DESC_MAX_LENGTH = 100

class User extends Model {
  static async createNewUser(account: string, password: string, userName: string): Promise<UserModel> {
    const accountExisted = !!(await User.getUserByAccount(account))
    if (accountExisted) {
      throw new HTTPError(ResponseCode.REPEAT_ERROR, '已存在该账号', 200)
    }
    const newUser = User.build({
      account,
      password,
      name: userName,
    })
    const result = await newUser.save()
    return result.get()
  }

  static async getUserByAccount(account: string) {
    const queryResult = await User.findAll({
      where: {
        account,
      },
    })
    if (queryResult.length) {
      const [result] = queryResult
      return result
    }
    return null
  }

  static async updateUser(account: string, data: Partial<UserModel>) {
    try {
      const target = await User.getUserByAccount(account)
      if (!target) {
        return false
      }

      Object.entries(data).forEach(([key, value]) => {
        target.set(key, value)
      })
      await target.save()
      return true
    } catch (err) {
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '保存失败，请重试', 200)
    }
  }
}
User.init(
  {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue() {
        return uuidv4()
      },
    },
    name: {
      type: DataTypes.STRING(USER_NAME_MAX_LENGTH),
      allowNull: false,
    },
    account: {
      type: DataTypes.STRING(ACCOUNT_MAX_LENGTH),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(PASSWORD_MAX_LENGTH),
      allowNull: false,
    },
    desc: {
      type: DataTypes.STRING(DESC_MAX_LENGTH),
      defaultValue() {
        return '请写下您的自我介绍'
      },
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    integration: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
  },
  {
    sequelize,
  },
)

export default User
