import type { Element, ElementContent, Text } from 'hast'
import type { Child } from 'hastscript'
import { AstroError } from 'astro/errors'
import { select } from 'hast-util-select'
import { toString } from 'hast-util-to-string'
import { h } from 'hastscript'
import { rehype } from 'rehype'
import { CONTINUE, SKIP, visit } from 'unist-util-visit'
import { resolveFolderIcon, resolveIcon } from './material-icons'

declare module 'vfile' {
  interface DataMap {
    directoryLabel: string
  }
}

/** Rehype processor to extract file tree data and turn each entry into its associated markup. */
const fileTreeProcessor = rehype()
  .data('settings', { fragment: true })
  .use(() => {
    return async (tree: Element, file) => {
      const { directoryLabel } = file.data

      validateFileTree(tree)

      const nodesToProcess: {
        node: Element
        isDirectory: boolean
        isPlaceholder: boolean
        isHighlighted: boolean
        name: string
        firstChild: ElementContent
        otherChildren: ElementContent[]
        comment: Child[]
      }[] = []

      visit(tree, 'element', (node) => {
        // Strip nodes that only contain newlines.
        node.children = node.children.filter(
          child => child.type === 'comment' || child.type !== 'text' || !/^\n+$/.test(child.value),
        )

        // Skip over non-list items.
        if (node.tagName !== 'li') {
          return CONTINUE
        }

        const [firstChild, ...otherChildren] = node.children

        // Keep track of comments associated with the current file or directory.
        const comment: Child[] = []

        // Extract text comment that follows the file name, e.g. `README.md This is a comment`
        if (firstChild?.type === 'text') {
          const [filename, ...fragments] = firstChild.value.split(' ')
          firstChild.value = filename || ''
          const textComment = fragments.join(' ').trim()
          if (textComment.length > 0) {
            comment.push(fragments.join(' '))
          }
        }

        // Comments may not always be entirely part of the first child text node,
        // e.g. `README.md This is an __important__ comment` where the `__important__` and `comment`
        // nodes would also be children of the list item node.
        const subTreeIndex = otherChildren.findIndex(
          child => child.type === 'element' && child.tagName === 'ul',
        )
        const commentNodes
          = subTreeIndex > -1 ? otherChildren.slice(0, subTreeIndex) : [...otherChildren]
        otherChildren.splice(0, subTreeIndex > -1 ? subTreeIndex : otherChildren.length)
        comment.push(...commentNodes)

        const firstChildTextContent = firstChild ? toString(firstChild) : ''

        // Decide a node is a directory if it ends in a `/` or contains another list.
        const isDirectory
          = /\/\s*$/.test(firstChildTextContent)
            || otherChildren.some(child => child.type === 'element' && child.tagName === 'ul')
        // A placeholder is a node that only contains 3 dots or an ellipsis.
        const isPlaceholder = /^\s*(?:\.{3}|…)\s*$/.test(firstChildTextContent)
        // A node is highlighted if its first child is bold text, e.g. `**README.md**`.
        const isHighlighted = firstChild?.type === 'element' && firstChild.tagName === 'strong'

        nodesToProcess.push({
          node,
          isDirectory,
          isPlaceholder,
          isHighlighted,
          name: firstChildTextContent.replace(/\/$/, '').trim(),
          firstChild: firstChild!,
          otherChildren,
          comment,
        })

        if (isDirectory) {
          // Continue down the tree.
          return CONTINUE
        }

        // Files can’t contain further files or directories, so skip iterating children.
        return SKIP
      })

      for (const item of nodesToProcess) {
        const { node, isDirectory, isPlaceholder, isHighlighted, name, firstChild, otherChildren, comment } = item

        // Create an icon for the file or directory (placeholder do not have icons).
        const icon = await (isDirectory ? getFolderIcon(name) : getFileIcon(name))

        // Add classes and data attributes to the list item node.
        node.properties!.class = isDirectory ? 'directory' : 'file'
        if (isPlaceholder) {
          node.properties!.class += ' empty'
        }

        // Create the tree entry node that contains the icon, file name and comment which will end up
        // as the list item’s children.
        const treeEntryChildren: Child[] = [
          h('span', { class: isHighlighted ? 'highlight' : '' }, [
            isPlaceholder ? null : icon,
            firstChild,
          ]),
        ]

        if (comment.length > 0) {
          treeEntryChildren.push(makeText(' '), h('span', { class: 'comment' }, ...comment))
        }

        const treeEntry = h('span', { class: 'tree-entry' }, ...treeEntryChildren)

        if (isDirectory) {
          if (isDirectory && icon.properties) {
            // Add a screen reader only label for directories before the icon so that it is announced
            // as such before reading the directory name.
            icon.children.unshift(h('span', { class: 'sr-only' }, directoryLabel))
          }

          const hasContents = otherChildren.length > 0

          node.children = [
            h('details', { open: hasContents }, [
              h('summary', { class: 'tree-icon-container' }, treeEntry),
              ...(hasContents ? otherChildren : [h('ul', h('li', '…'))]),
            ]),
          ]
        }
        else {
          node.children = [treeEntry, ...otherChildren]
        }
      }
    }
  })

/**
 * Process the HTML for a file tree to create the necessary markup for each file and directory
 * including icons.
 * @param html Inner HTML passed to the `<FileTree>` component.
 * @param directoryLabel The localized label for a directory.
 * @returns The processed HTML for the file tree.
 */
export async function processFileTree(html: string, directoryLabel: string): Promise<string> {
  const file = await fileTreeProcessor.process({ data: { directoryLabel }, value: html })

  return file.toString()
}

/** Make a text node with the pass string as its contents. */
function makeText(value = ''): Text {
  return { type: 'text', value }
}

/** Return the icon for a file based on its file name. */
async function getFileIcon(fileName: string): Promise<Element> {
  const iconClass = await resolveIcon(fileName, undefined)()
  const icon = h('span', { class: ['tree-icon', iconClass].filter(Boolean) as string[] })
  if (iconClass?.startsWith('i-material-icon-theme:')) {
    icon.properties!['data-icon'] = iconClass
  }
  return icon
}

/** Return the icon for a folder based on its name. */
async function getFolderIcon(folderName: string): Promise<Element> {
  const [closedClass, openClass] = await Promise.all([
    resolveFolderIcon(folderName, false)(),
    resolveFolderIcon(folderName, true)(),
  ])
  return h('span', {}, [
    h('span', {
      'class': ['tree-icon', 'icon-closed', closedClass].filter(Boolean) as string[],
      'data-icon': closedClass,
    }),
    h('span', {
      'class': ['tree-icon', 'icon-open', openClass].filter(Boolean) as string[],
      'data-icon': openClass,
    }),
  ])
}

/** Validate that the user provided HTML for a file tree is valid. */
function validateFileTree(tree: Element) {
  const rootElements = tree.children.filter(isElementNode)
  const [rootElement] = rootElements

  if (rootElements.length === 0) {
    throwFileTreeValidationError(
      'The `<FileTree>` component expects its content to be a single unordered list but found no child elements.',
    )
  }

  if (rootElements.length !== 1) {
    throwFileTreeValidationError(
      `The \`<FileTree>\` component expects its content to be a single unordered list but found multiple child elements: ${rootElements
        .map(element => `\`<${element.tagName}>\``)
        .join(' - ')}.`,
    )
  }

  if (!rootElement || rootElement.tagName !== 'ul') {
    throwFileTreeValidationError(
      `The \`<FileTree>\` component expects its content to be an unordered list but found the following element: \`<${rootElement?.tagName}>\`.`,
    )
  }

  const listItemElement = select('li', rootElement)

  if (!listItemElement) {
    throwFileTreeValidationError(
      'The `<FileTree>` component expects its content to be an unordered list with at least one list item.',
    )
  }
}

function isElementNode(node: ElementContent): node is Element {
  return node.type === 'element'
}

/** Throw a validation error for a file tree linking to the documentation. */
function throwFileTreeValidationError(message: string): never {
  throw new AstroError(
    message,
    'To learn more about the `<FileTree>` component, see https://starlight.astro.build/components/file-tree/',
  )
}

export interface Definitions {
  files: Record<string, string>
  extensions: Record<string, string>
  partials: Record<string, string>
}
