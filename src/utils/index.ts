/* eslint-disable no-unused-vars */
import { CouponTimeStatus, ResponseCode } from 'utils/contants'
import HttpError from 'utils/http_error'
import { createReadStream, createWriteStream } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { resolve } from 'path'

export function createRes<T>(code: number, data: T, msg?: string) {
  return {
    code,
    data,
    msg,
  }
}
export async function saveFile(file: any) {
  const { filepath, originalFilename } = file
  const ext = originalFilename.replace(/.*(?=\.)/, '')
  const reader = createReadStream(filepath)
  const fileName = `${uuidv4()}${ext}`
  const writer = createWriteStream(resolve('static', fileName))
  const finalW = reader.pipe(writer)
  return new Promise<string>((res, rej) => {
    finalW.on('error', (err) => {
      console.error(err)
      rej(new HttpError(ResponseCode.FILE_UP_ERROR, '文件上传失败', 200))
    })
    finalW.on('finish', () => {
      res(`http://localhost:4000/public/${fileName}`)
    })
  })
}
export function partialObj<T, K extends keyof T>(data: T, keys: K[]) {
  return keys.reduce((result, key) => {
    // eslint-disable-next-line no-param-reassign
    result[key] = data[key]
    return result
  }, {} as { [k in K]: T[k] })
}

export function validateCouponTime(startTime: string, endTime: string) {
  const startTimeStamp = new Date(startTime).valueOf()
  const endTimeStamp = new Date(endTime).valueOf()
  const curTimeStamp = Date.now()
  if (startTimeStamp > curTimeStamp) {
    return CouponTimeStatus.BEFORE
  }
  if (endTimeStamp < curTimeStamp) {
    return CouponTimeStatus.OUT
  }
  return CouponTimeStatus.AVAILABLE
}
