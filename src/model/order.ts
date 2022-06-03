import { Model, DataTypes, WhereOptions } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from 'controller/db'
import { RequestCreateOrder, RequestPage } from 'types/server'
import HTTPError from 'utils/http_error'
import { OrderStatus, ResponseCode } from 'utils/contants'
import { partialObj } from 'utils/index'
import { AddressModel } from 'types/index'
import OrderDetail from './order_detail'
import Good from './good'
import UserCoupon from './user_coupon'

class Order extends Model {
  static async addOne(userId: string, params: RequestCreateOrder) {
    try {
      const result = await Order.create({
        total: params.total,
        status: params.status,
        leaveMessage: params.leaveMessage,
        payMethod: params.payMethod,
        name: params.name,
        addressDetail: params.addressDetail,
        tel: params.tel,
        fromUserId: userId,
        couponId: params.couponId || '-1',
      })
      if (params.status === OrderStatus.WAITDELIVER) {
        const userRecord = await (result as any).getUser()
        await userRecord.decrement({ integration: params.total })
      }
      const uuid = result.getDataValue('uuid')
      await OrderDetail.addMany(params.goods, uuid)
      return result
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常', 500)
    }
  }

  static async getOne(id: string) {
    try {
      const result = await Order.findOne({
        where: {
          uuid: id,
        },
        include: {
          model: OrderDetail,
          attributes: ['count', 'price'],
          include: [
            {
              model: Good,
              attributes: ['uuid', 'title', 'goodType', 'type', 'goodImg'],
            },
          ],
        },
      })
      if (result) {
        const orderData = result.get()
        const orderDetails = orderData.OrderDetails.map((item: any) => {
          const orderDetailData = item.get()
          const goodData = orderDetailData.Good.get()
          delete orderDetailData.Good
          return {
            ...orderDetailData,
            ...goodData,
          }
        })
        delete orderData.OrderDetails
        return {
          ...orderData,
          goods: orderDetails,
        }
      }
      return null
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常', 500)
    }
  }

  static async getByPage(userId: string, params: RequestPage) {
    try {
      const { offset = 0, size = 20, type } = params
      const whereRule: WhereOptions = {
        fromUserId: userId,
      }
      if (type && type !== 'all') {
        whereRule.status = type
      }
      const result = await Order.findAndCountAll({
        order: [['createdAt', 'DESC']],
        offset,
        limit: size,
        where: whereRule,
        include: {
          model: OrderDetail,
          attributes: ['count', 'price'],
          include: [
            {
              model: Good,
              attributes: ['uuid', 'title', 'goodType', 'type', 'goodImg'],
            },
          ],
        },
      })
      // fixme 第一次查出来的总数有bug
      const count = await Order.count({
        where: whereRule,
      })

      const formatRecords = result.rows.map((orderRecord) => {
        const orderData = orderRecord.get()
        const orderDetails = orderData.OrderDetails.map((item: any) => {
          const orderDetailData = item.get()
          const goodData = orderDetailData.Good.get()
          delete orderDetailData.Good
          return {
            ...orderDetailData,
            ...goodData,
          }
        })
        return {
          ...partialObj(orderData, ['uuid', 'total', 'status']),
          goods: orderDetails,
        }
      })
      return {
        count,
        data: formatRecords,
      }
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '数据库查询失败', 200)
    }
  }

  static async pay(id: string, userMoney: number, newAddress?: AddressModel) {
    try {
      const orderRecord = await Order.findOne({
        where: {
          uuid: id,
        },
      })
      if (!orderRecord) {
        return {
          error: true,
          msg: '该订单不存在',
        }
      }
      const totalPrice = orderRecord.getDataValue('total')
      if (totalPrice < userMoney) {
        return {
          error: true,
          msg: '余额不足',
        }
      }
      orderRecord.set('status', OrderStatus.WAITDELIVER)
      if (newAddress) {
        orderRecord.set({
          addressDetail: newAddress.addressDetail,
          name: newAddress.name,
          tel: newAddress.tel,
        })
      }
      const userRecord = await (orderRecord as any).getUser()
      await userRecord.decrement({ integration: totalPrice })
      await orderRecord.save()
      return {
        error: false,
        msg: '',
      }
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常', 500)
    }
  }

  static async sendGood(id: string) {
    try {
      const orderRecord = await Order.findOne({
        where: {
          uuid: id,
        },
      })
      if (!orderRecord) {
        return false
      }

      orderRecord.set('status', OrderStatus.FOR_GOODS)
      await orderRecord.save()
      return true
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常', 500)
    }
  }

  static async receiveGood(id: string) {
    try {
      const orderRecord = await Order.findOne({
        where: {
          uuid: id,
        },
      })
      if (!orderRecord) {
        return false
      }

      orderRecord.set('status', OrderStatus.TO_EVALUATE)
      await orderRecord.save()
      return true
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常', 500)
    }
  }

  static async cancelOrder(id: string, userId: string) {
    try {
      const orderRecord = await Order.findOne({
        where: {
          uuid: id,
        },
      })
      if (!orderRecord) {
        return false
      }
      const couponId = orderRecord.getDataValue('couponId')
      if (couponId !== -1) {
        await UserCoupon.returnOne(userId, couponId)
      }
      await (orderRecord as any).setOrderDetails([])
      await orderRecord.destroy()
      return true
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常', 500)
    }
  }

  static async success(id: string) {
    try {
      const orderRecord = await Order.findOne({
        where: {
          uuid: id,
        },
        include: {
          model: OrderDetail,
          attributes: ['count', 'goodId'],
        },
      })
      if (!orderRecord) {
        return false
      }
      const orderData = orderRecord.get()
      const goodSales = orderData.OrderDetails.map((item: any) => ({ ...item.get() }))
      await Good.changeSales(goodSales, true)
      orderRecord.set('status', OrderStatus.SUCCESS)
      await orderRecord.save()
      return true
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常', 500)
    }
  }

  static async refund(id: string, reason: string) {
    try {
      const orderRecord = await Order.findOne({
        where: {
          uuid: id,
        },
      })
      if (!orderRecord) {
        return false
      }

      orderRecord.set('originStatus', orderRecord.getDataValue('status'))
      orderRecord.set('status', OrderStatus.REFUND_ING)
      orderRecord.set('refundReason', reason)
      await orderRecord.save()
      return true
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常', 500)
    }
  }

  static async refundCancel(id: string) {
    try {
      const orderRecord = await Order.findOne({
        where: {
          uuid: id,
        },
      })
      if (!orderRecord) {
        return false
      }

      orderRecord.set('status', orderRecord.getDataValue('originStatus'))
      orderRecord.set('originStatus', '')
      orderRecord.set('refundReason', '')
      await orderRecord.save()
      return true
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常', 500)
    }
  }

  static async refundSuccess(id: string) {
    try {
      const orderRecord = await Order.findOne({
        where: {
          uuid: id,
        },
        include: {
          model: OrderDetail,
          attributes: ['count', 'goodId'],
        },
      })
      if (!orderRecord) {
        return false
      }
      const orderData = orderRecord.get()
      const goodSales = orderData.OrderDetails.map((item: any) => ({ ...item.get() }))
      await Good.changeSales(goodSales, false)
      const totalPrice = orderRecord.getDataValue('total')
      const userRecord = await (orderRecord as any).getUser()
      await userRecord.increment({ integration: totalPrice })
      orderRecord.set('status', OrderStatus.REFUND_END)
      await orderRecord.save()
      return true
    } catch (err) {
      console.error(err)
      throw new HTTPError(ResponseCode.DATABASE_ERROR, '服务器异常', 500)
    }
  }
}

Order.init(
  {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue() {
        return uuidv4()
      },
    },
    total: {
      type: DataTypes.DOUBLE,
    },
    status: {
      type: DataTypes.STRING,
    },
    originStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    leaveMessage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refundReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payMethod: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addressDetail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
  },
)

export default Order
