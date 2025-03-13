import { reduceConfigs } from 'reduce-configs'
import { compile, compileClient } from 'pug'
export const PLUGIN_PUG_NAME = 'rsbuild:pug'

export const pluginPug = (options) => ({
  name: PLUGIN_PUG_NAME,

  async setup(api) {
    const VUE_SFC_REGEXP = /\.vue$/

    const pugOptions = reduceConfigs({
      initial: {
        doctype: 'html',
        compileDebug: false
      },
      config: options.pugOptions
    })

    api.transform({ test: /\.pug$/ }, ({ code, resourcePath, addDependency }) => {
      const options = {
        filename: resourcePath,
        ...pugOptions
      }

      if (VUE_SFC_REGEXP.test(resourcePath)) {
        let template
        try {
          template = compile(code, options)
          const { dependencies } = template
          if (dependencies) dependencies.forEach(addDependency)
          return template()
        } catch (e) {
          addDependency(e.filename)
          return '<pre>' + e.message + '</pre>'
        }
      }

      const templateCode = compileClient(code, options)
      return `${templateCode}; export default template;`
    })
  }
})
