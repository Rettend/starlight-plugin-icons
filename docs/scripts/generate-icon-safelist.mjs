import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Glob } from 'bun'
import { getIconDetails, resolveFolderIcon, resolveIcon } from './../src/lib/material-icons.mjs'

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..')
const pattern = 'src/content/**/*.{md,mdx}'
const cacheDir = path.join(rootDir, '.material-icons-cache')
const safelistPath = path.join(cacheDir, 'material-icons-safelist.json')

const codeBlockRegex = /```(?<lang>[a-zA-Z]\w*)?(?:\s[^\n]*?title="(?<title>[^"]+)")?/g
const fileTreeRegex = /<FileTree>([\s\S]*?)<\/FileTree>/g

async function generateSafelist() {
  const glob = new Glob(pattern)
  const files = glob.scanSync({ cwd: rootDir, absolute: true })
  if (files.length === 0)
    console.warn(`No content files found for safelist generation (pattern: ${pattern})`)

  const usedIcons = new Set()

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8')

    // Icons from code blocks
    const codeBlockMatches = content.matchAll(codeBlockRegex)
    for (const match of codeBlockMatches) {
      const { lang, title } = match.groups
      const iconDetails = await getIconDetails(title, lang)
      if (iconDetails?.iconClass)
        usedIcons.add(iconDetails.iconClass)
    }

    // Icons from FileTree components
    const fileTreeMatches = content.matchAll(fileTreeRegex)
    for (const fileTreeMatch of fileTreeMatches) {
      const fileTreeContent = fileTreeMatch[1]
      if (!fileTreeContent)
        continue

      const lines = fileTreeContent.trim().split('\n').map(line => ({
        indentation: line.match(/^\s*/)[0].length,
        content: line.trim(),
      }))

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (!line.content.startsWith('- '))
          continue

        const entryName = line.content.substring(2).replace(/`/g, '').split(' ')[0].trim()
        if (!entryName || ['...', '…'].includes(entryName))
          continue

        const isDirectory = entryName.endsWith('/')
          || (i + 1 < lines.length && lines[i + 1].indentation > line.indentation)

        if (isDirectory) {
          const folderName = entryName.replace(/\/$/, '')
          const [closedIcon, openIcon] = await Promise.all([
            resolveFolderIcon(folderName, false)(),
            resolveFolderIcon(folderName, true)(),
          ])
          if (closedIcon)
            usedIcons.add(closedIcon)
          if (openIcon)
            usedIcons.add(openIcon)
        }
        else {
          const iconClass = await resolveIcon(entryName, null)()
          if (iconClass)
            usedIcons.add(iconClass)
        }
      }
    }
  }

  await fs.mkdir(cacheDir, { recursive: true })
  await fs.writeFile(safelistPath, JSON.stringify([...usedIcons].sort(), null, 2), 'utf-8')

  // eslint-disable-next-line no-console
  console.log(`Generated icon safelist with ${usedIcons.size} icons.`)
}

generateSafelist()
