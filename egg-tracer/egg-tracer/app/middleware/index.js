const usergent = require('useragent')
const { resolve } = require('path')
const { readFileSync } = require('fs')
const viewPath = resolve(__dirname, '../view/report.html')

module.exports = ({getUser, getIp, save, auth, pathUrl, getData}, app) => {
  
  const template = readFileSync(viewPath).toString()

  const report = async ctx => {
    if (ctx.path === pathUrl) {
      const can = await auth(ctx)
      if (can) {
        ctx.type = 'text/html'
        const data = await getData(ctx)
        ctx.body = eval(template)
        return true
      } else {
        ctx.status = 403
        return false
      }
    } 
  }


  return async (ctx, next) => {
    const skip = await report(ctx)

    const agent = (ctx.agent = usergent.parse(
      ctx.request.header['user-agent']
    ))

    // 中间件返回
    await next()
    if (skip) return

    const user = await getUser(ctx)
    const path = ctx.request.path
    const ip = await getIp(ctx)
    const referrer = ctx.request.header['referrer'] || ''
    const data = {
      username: user.username || '',
      user_id: user.id || '',
      path,
      referrer,
      ip,
      os: agent.os.family,
      browser: agent.family,
      device: agent.device.family
    }
    try {
      // IO操作
      await save(ctx, data)
    } catch (e) {
      ctx.logger.error(e)
      console.log(e)
    }

  }

}