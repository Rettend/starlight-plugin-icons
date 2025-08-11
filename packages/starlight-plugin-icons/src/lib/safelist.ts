import type { AstroIntegrationLogger } from './types'
import fs from 'node:fs/promises'
import path from 'node:path'
import { globSync } from 'glob'
import { getIconDetails, resolveFolderIcon, resolveIcon } from './material-icons'

const codeBlockRegex = /```(?<lang>[a-zA-Z]\w*)?(?:\s[^\n]*?title="(?<title>[^"]+)")?/g
const fileTreeRegex = /<FileTree>([\s\S]*?)<\/FileTree>/g
const iconClassRegex = /i-[a-z0-9-]+:[a-z0-9-:./]+/gi

export async function generateSafelist(logger: AstroIntegrationLogger, rootDir: string): Promise<boolean> {
  const contentDir = path.join(rootDir, 'src/content')
  const pattern = '**/*.{md,mdx}'
  const files = globSync(pattern, { cwd: contentDir, absolute: true })

  if (files.length === 0) {
    logger.warn(`No content files found for safelist generation (pattern: ${pattern})`)
  }

  const usedIcons = new Set<string>()

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8')

    // Icons from code blocks
    const codeBlockMatches = content.matchAll(codeBlockRegex)
    for (const match of codeBlockMatches) {
      const { lang, title } = match.groups as { lang?: string, title?: string }
      const iconDetails = await getIconDetails(title, lang)
      if (iconDetails?.iconClass) {
        usedIcons.add(iconDetails.iconClass)
      }
    }

    // Icons from FileTree components
    const fileTreeMatches = content.matchAll(fileTreeRegex)
    for (const fileTreeMatch of fileTreeMatches) {
      const fileTreeContent = fileTreeMatch[1]
      if (!fileTreeContent) {
        continue
      }

      const lines = fileTreeContent
        .trim()
        .split('\n')
        .map(line => ({
          indentation: (line.match(/^\s*/) ?? [''])[0].length,
          content: line.trim(),
        }))

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (!line || !line.content.startsWith('- ')) {
          continue
        }

        const rawEntry = line.content.substring(2).split(' ')[0] ?? ''
        const entryName = normalizeFileTreeEntry(rawEntry)
        if (!entryName || ['...', '…'].includes(entryName)) {
          continue
        }

        const nextLine = lines[i + 1]
        const isDirectory
          = entryName.endsWith('/')
            || (nextLine && nextLine.indentation > line.indentation)

        if (isDirectory) {
          const folderName = entryName.trim().replace(/[/\\]+$/, '')
          const [closedIcon, openIcon] = await Promise.all([
            resolveFolderIcon(folderName, false)(),
            resolveFolderIcon(folderName, true)(),
          ])
          if (closedIcon) {
            usedIcons.add(closedIcon)
          }
          if (openIcon) {
            usedIcons.add(openIcon)
          }
        }
        else {
          const iconClass = await resolveIcon(entryName, undefined)()
          if (iconClass) {
            usedIcons.add(iconClass)
          }
        }
      }
    }
  }

  // Sidebar icon classes
  const astroConfigs = [
    'astro.config.mjs',
    'astro.config.js',
    'astro.config.ts',
    'astro.config.mts',
    'astro.config.cjs',
    'astro.config.cts',
  ]
  for (const cfg of astroConfigs) {
    const cfgPath = path.join(rootDir, cfg)
    try {
      const source = await fs.readFile(cfgPath, 'utf-8')
      const matches = source.match(iconClassRegex) || []
      for (const cls of matches) usedIcons.add(cls)
    }
    catch {
    }
  }

  const newSafelist = [...usedIcons].sort()
  const cacheDir = path.join(rootDir, '.starlight-icons')
  const safelistPath = path.join(cacheDir, 'safelist.json')
  const newSafelistJSON = JSON.stringify(newSafelist, null, 2)

  try {
    const currentSafelist = await fs.readFile(safelistPath, 'utf-8')
    if (currentSafelist === newSafelistJSON) {
      logger.info('Icon safelist is up to date.')
      return false
    }
  }
  catch {
    if (newSafelist.length === 0) {
      return false
    }
  }

  await fs.mkdir(cacheDir, { recursive: true })
  await fs.writeFile(safelistPath, newSafelistJSON, 'utf-8')

  logger.info(`Generated icon safelist with ${usedIcons.size} icons.`)
  return true
}

/**
 * Normalize a raw FileTree entry label into a filename/folder name we can resolve icons for.
 * - Strips inline code backticks
 * - Removes surrounding Markdown emphasis/strong markers (*, **, _, __)
 */
function normalizeFileTreeEntry(input: string): string {
  let name = input.replace(/`/g, '').trim()
  name = name.replace(/^\*\*(.+)\*\*$/, '$1')
  name = name.replace(/^__(.+)__$/, '$1')
  name = name.replace(/^\*(.+)\*$/, '$1')
  name = name.replace(/^_(.+)_$/, '$1')
  return name
}
