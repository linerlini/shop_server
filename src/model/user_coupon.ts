import sequelize from 'controller/db'
import { Model, DataTypes } from 'sequelize'
import { CouponModel, UserCouponModel } from 'types/index'
import { validateCouponTime } from 'utils/index'
import { CouponTimeStatus, ResponseCode } from 'utils/contants'
import HTTPError from 'utils/http_error'
import { v4 as uuidV4 } from 'uuid'
import Coupon from './coupon'

class UserCoupon extends Model {
  static async getAll(userId: string) {
    try {
      const result = await UserCoupon.findAll({
        where: {
          userId,
        },
        include: [
          {
            model: Coupon,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
        ],
        order: [['createdAt', 'DESC']],
      })
      const formatResult = result.map<UserCouponModel>((item) => {
        const formatItem = item.get()
        const couponInfo = formatItem.Coupon.get()

        return {
          ...couponInfo,
          status: formatItem.status,
        }
      })
      return formatResult
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常，请重试', 500)
    }
  }

  static async addOne(userId: string, couponId: string): Promise<{ status: boolean; msg: string; data: UserCouponModel | null }> {
    try {
      const target = await UserCoupon.findOne({
        where: {
          userId,
          couponId,
        },
      })
      if (target) {
        return {
          status: false,
          msg: '不可重复领取该优惠卷',
          data: null,
        }
      }
      const coupon = await Coupon.findOne({
        where: {
          uuid: couponId,
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      })
      if (coupon) {
        const couponInfo = coupon.get() as CouponModel
        const validateStatus = validateCouponTime(couponInfo.startAt, couponInfo.endAt)
        if (validateStatus === CouponTimeStatus.OUT) {
          return {
            status: false,
            msg: '该优惠卷已过期',
            data: null,
          }
        }
        await UserCoupon.create({
          userId,
          couponId,
        })
        return {
          status: true,
          data: {
            ...couponInfo,
            status: 1,
          },
          msg: '',
        }
      }
      return {
        status: false,
        msg: '不存在该优惠卷',
        data: null,
      }
    } catch (err) {
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '保存失败，请重试', 200)
    }
  }

  static async useOne(userId: string, couponId: string) {
    try {
      const result = await UserCoupon.findOne({
        where: {
          userId,
          couponId,
        },
      })
      if (result) {
        result.set('status', 0)
        await result.save()
      }
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常，请重试', 500)
    }
  }
}
UserCoupon.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue() {
        return uuidV4()
      },
      primaryKey: true,
    },
    // 0用了 1没用
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  { sequelize },
)

export default UserCoupon
