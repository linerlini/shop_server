import HttpError from 'utils/http_error'
import * as jwt from 'jsonwebtoken'
import { JWTPayload } from '../types/server'

const SECRET = 'testtest'
export async function sign(data: JWTPayload) {
  const token = await new Promise((res, rej) => {
    jwt.sign(
      {
        data,
      },
      SECRET,
      {
        expiresIn: '2h',
      },
      (err, encode) => {
        if (err) {
          console.error(err)
          rej(new HttpError(0, '登录失败', 200))
        } else {
          res(encode)
        }
      },
    )
  })
  return token as string
}
type TokenStatus = 'success' | 'timeout' | 'wrong'
export async function verify(token?: string) {
  let result: TokenStatus = 'wrong'
  if (!token) {
    return result
  }
  try {
    result = await new Promise<TokenStatus>((res, rej) => {
      jwt.verify(token, SECRET, {}, (err) => {
        if (err) {
          rej(err)
        } else {
          res('success')
        }
      })
    })
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      result = 'timeout'
    } else if (err instanceof jwt.JsonWebTokenError) {
      result = 'wrong'
    }
  }
  return result
}
export async function decodeToken(token: string) {
  const { data } = jwt.decode(token) as jwt.JwtPayload
  return data as JWTPayload
}
