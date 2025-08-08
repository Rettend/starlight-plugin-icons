import { h } from 'hastscript'
import { getIconDetails } from './material-icons'

export function pluginIcon() {
  return {
    name: 'Plugin Icon',
    hooks: {
      async postprocessRenderedBlock(context: any): Promise<void> {
        const { codeBlock, renderData } = context

        if (!codeBlock.props.title)
          return

        const iconDetails = await getIconDetails(codeBlock.props.title, codeBlock.language)
        if (!iconDetails)
          return

        const { iconClass, language } = iconDetails
        if (!iconClass)
          return

        const ast = renderData?.blockAst as any
        if (!ast || !('children' in ast))
          return

        const figcaption = ast.children.find(
          (child: any) => child.type === 'element' && child.tagName === 'figcaption',
        )

        if (!figcaption?.children)
          return

        const titleSpan = figcaption.children.find(
          (child: any) =>
            child.type === 'element'
            && child.tagName === 'span'
            && child.properties?.className?.includes('title'),
        )

        const iconClasses = [iconClass, 'code-block-icon']

        const icon = h('span', {
          'className': iconClasses,
          'data-icon': iconClass,
          'data-language': language,
        })

        if (titleSpan) {
          if (!titleSpan.children)
            titleSpan.children = []
          titleSpan.children.unshift(icon)
        }
        else {
          figcaption.children.unshift(icon)
        }
      },
    },
  }
}
