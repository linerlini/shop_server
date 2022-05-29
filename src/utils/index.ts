import { ResponseCode } from 'utils/contants'
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
  console.log(resolve('static', uuidv4(), ext))
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
