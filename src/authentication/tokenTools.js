import createHttpError from "http-errors"
import jwt from "jsonwebtoken"
import authorModel from "../authors/model.js"

export const createTokens = async author => {
  
  const accessToken = await createAccessToken({ _id: author._id, role: author.role });
  const refreshToken = await createRefreshToken({ _id: author._id });

  author.refreshToken = refreshToken;
  await author.save();

  return { accessToken, refreshToken }
}

const createAccessToken = payload =>
  new Promise((res, rej) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1m" }, (err, token) => {
      if (err) rej(err);
      else res(token);
    })
  )

export const verifyAccessToken = accessToken =>
  new Promise((res, rej) =>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) rej(err);
      else res(originalPayload);
    })
  )

const createRefreshToken = payload =>
  new Promise((res, rej) =>
    jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    })
  )

const verifyRefreshToken = accessToken =>
  new Promise((res, rej) =>
    jwt.verify(accessToken, process.env.REFRESH_SECRET, (err, originalPayload) => {
      if (err) rej(err);
      else res(originalPayload);
    })
  )

export const refreshTokens = async currentRefreshToken => {
  try {    
    const refreshTokenPayload = await verifyRefreshToken(currentRefreshToken);
    const author = await authorModel.findById(refreshTokenPayload._id);
    if (!author) throw new createHttpError(404, `Author with id ${refreshTokenPayload._id} not found!`);
    if (author.refreshToken && author.refreshToken === currentRefreshToken) {
      const { accessToken, refreshToken } = await createTokens(author)
      return { accessToken, refreshToken }
    } else {
      throw new createHttpError(401, "Refresh token invalid!")
    }
  } catch (error) {
    throw new createHttpError(401, "Refresh token invalid!")
  }
}