'use strict';

// 默认配置

exports.keys = '123456'

exports.data = []


/**
 * egg-tracer default config
 * @member Config#tracer
 * @property {String} SOME_KEY - some description
 */
exports.tracer = {
  // 获取用户
  getUser(ctx) {
    return ctx.seesion.user || ''
  },

  // 获取 IP
  getIp(ctx) {
    if (ctx.app.config.proxy && ctx.request.ips) {
      return ctx.request.ips
    }
    return ctx.request.ip || ''
  },

  // 存储数据
  async save(ctx, data) {
    return ctx.app.config.data.push(data)
  },

  // 
  async auth(ctx) {
    return true
  },

  // 拿到数据
  async getData(ctx) {
    return ctx.app.config.data
  },

  pathUrl: '/tracer/_report'

};
