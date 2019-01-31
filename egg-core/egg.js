const { resolve, join, parse } = require('path')
const globby = require('globby')

module.exports = app => {

  const AppPath = resolve(__dirname, 'app')
  const context = app['context']
  // 返回了 folderMap
  const fileAbsolutePath = ['config', 'middleware', 'service'].reduce(
    (folderMap, v) => ((folderMap[v] = join(AppPath, v)), folderMap), {}
  )

  Object.keys(fileAbsolutePath).forEach(v => {
    const path = fileAbsolutePath[v]
    const prop = v // 挂载到 ctx 上面的 key
    const files = globby.sync("**/*.js", {
      cwd: path
    })
    if (prop !== 'middleware') {
      context[prop] = {} // 初始化对象
    }

    files.forEach(file => {

      const filename = parse(file).name
      const content = require(join(path), file) // 导入内容
      // middleware 处理逻辑
      if (prop === 'middleware') {
        if (filename in context['config']) {
          const plugin = content(context['config'][filename])
          app.use(plugin)
        }
        return
      }

      // 配置文件处理
      if (prop === 'config' && content) {
        context[prop] = Object.assign({}, context[prop], content)
        return
      }

      context[prop][filename] = content // 挂载 service

    })   
  })
}