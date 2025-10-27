import type { RequestHandler } from 'express';

const healthCheckController: RequestHandler = async (req, res, next) => {
  try {
    res.status(200).json({
      message: 'OK',
      timestamp: Date.now(),
      uptime: process.uptime()
    })
  } catch (e) {
    next(e)
  }
}

export { healthCheckController };
