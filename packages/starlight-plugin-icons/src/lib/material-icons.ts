import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const CACHE_DIR = path.join(process.cwd(), '.material-icons-cache')
const VERSION_URL = 'https://raw.githubusercontent.com/Rettend/github-material-icon-theme/main/download/version.txt'
const LANGUAGE_MAP_URL = 'https://raw.githubusercontent.com/Rettend/github-material-icon-theme/main/download/language-map.json'
const MATERIAL_ICONS_URL = 'https://raw.githubusercontent.com/Rettend/github-material-icon-theme/main/download/material-icons.json'

let cachedData: MaterialIconsData | null = null

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
  }
  catch {
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }

  return response.text()
}

async function getCachedVersion(): Promise<string | null> {
  try {
    const versionFile = path.join(CACHE_DIR, 'version.txt')
    return await fs.readFile(versionFile, 'utf-8')
  }
  catch {
    return null
  }
}

async function setCachedVersion(version: string) {
  await ensureCacheDir()
  const versionFile = path.join(CACHE_DIR, 'version.txt')
  await fs.writeFile(versionFile, version, 'utf-8')
}

async function getCachedData(): Promise<MaterialIconsData | null> {
  try {
    const languageMapFile = path.join(CACHE_DIR, 'language-map.json')
    const materialIconsFile = path.join(CACHE_DIR, 'material-icons.json')

    const [languageMap, materialIcons] = await Promise.all([
      fs.readFile(languageMapFile, 'utf-8').then(JSON.parse) as Promise<LanguageMap>,
      fs.readFile(materialIconsFile, 'utf-8').then(JSON.parse) as Promise<MaterialIcons>,
    ])

    return { languageMap, materialIcons }
  }
  catch {
    return null
  }
}

async function setCachedData(data: MaterialIconsData) {
  await ensureCacheDir()
  const languageMapFile = path.join(CACHE_DIR, 'language-map.json')
  const materialIconsFile = path.join(CACHE_DIR, 'material-icons.json')

  await Promise.all([
    fs.writeFile(languageMapFile, JSON.stringify(data.languageMap, null, 2), 'utf-8'),
    fs.writeFile(materialIconsFile, JSON.stringify(data.materialIcons, null, 2), 'utf-8'),
  ])
}

export async function getMaterialIconsData(): Promise<MaterialIconsData | undefined> {
  if (cachedData) {
    return cachedData
  }

  try {
    const [currentVersion, cachedVersion] = await Promise.all([
      fetchText(VERSION_URL).then(v => v.trim()),
      getCachedVersion(),
    ])

    let data: MaterialIconsData | null = null
    if (currentVersion === cachedVersion) {
      data = await getCachedData()
    }

    if (!data) {
      // eslint-disable-next-line no-console
      console.log('[starlight-plugin-icons] Fetching material icons data...')
      const [languageMap, materialIcons] = await Promise.all([
        fetchJson<LanguageMap>(LANGUAGE_MAP_URL),
        fetchJson<MaterialIcons>(MATERIAL_ICONS_URL),
      ])

      data = { languageMap, materialIcons }

      await Promise.all([
        setCachedData(data),
        setCachedVersion(currentVersion),
      ])
    }

    cachedData = data
    return data
  }
  catch (error) {
    if (error instanceof Error) {
      console.warn('Failed to fetch material icons data:', error.message)
    }
  }
}

export async function getIconDetails(title: string | undefined, language: string | undefined) {
  if (language === 'sh') {
    return null
  }

  const resolver = resolveIcon(title, language)
  const iconClass = await resolver()

  return {
    iconClass,
    language,
  }
}

export function resolveFolderIcon(folderName: string, isOpen: boolean) {
  return async function (): Promise<string | undefined> {
    const data = await getMaterialIconsData()
    if (!data)
      return

    const { materialIcons } = data
    const lowerFolderName = folderName
      .trim()
      .replace(/[\\/]+$/, '')
      .toLowerCase()

    const iconName = isOpen
      ? materialIcons.folderNamesExpanded[lowerFolderName]
      : materialIcons.folderNames[lowerFolderName]

    if (iconName && materialIcons.iconDefinitions[iconName]) {
      return `i-material-icon-theme:${iconName.replace(/_/g, '-')}`
    }

    return isOpen ? 'i-starlight-plugin-icons:folder-open' : 'i-starlight-plugin-icons:folder'
  }
}

export function resolveIcon(fileName: string | undefined, language: string | undefined) {
  return async function (): Promise<string | null> {
    const data = await getMaterialIconsData()
    if (!data)
      return null

    const { languageMap, materialIcons } = data

    if (!fileName && !language) {
      return null
    }

    if (fileName?.endsWith('.svelte.js')) {
      return 'i-starlight-plugin-icons:svelte-js'
    }
    if (fileName?.endsWith('.svelte.ts')) {
      return 'i-starlight-plugin-icons:svelte-ts'
    }

    function getIconClass(pairs: { key: string, lookup: Record<string, string> | undefined }[]): string | null {
      for (const pair of pairs) {
        if (pair.lookup) {
          const iconName = pair.lookup[pair.key]
          if (iconName && materialIcons.iconDefinitions[iconName]) {
            return `i-material-icon-theme:${iconName.replace(/_/g, '-')}`
          }
        }
      }
      return null
    }

    if (fileName) {
      const justFileName = fileName.includes('/') ? fileName.split('/').pop()! : fileName
      const lowerFileName = justFileName.toLowerCase()
      const longExtension = lowerFileName.split('.').slice(1).join('.')
      const shortExtension = lowerFileName.split('.').pop() || ''

      const pairs = [
        { key: lowerFileName, lookup: materialIcons.fileNames },
        { key: longExtension, lookup: materialIcons.fileExtensions },
        { key: shortExtension, lookup: materialIcons.fileExtensions },
        { key: shortExtension, lookup: languageMap.fileExtensions },
      ]

      const iconClass = getIconClass(pairs)
      if (iconClass) {
        return iconClass
      }

      // handle files starting with a dot
      if (!lowerFileName.startsWith('.')) {
        const dotPrefixed = `.${lowerFileName}`
        const dotIconName = materialIcons.fileNames[dotPrefixed]
        if (dotIconName && materialIcons.iconDefinitions[dotIconName]) {
          return `i-material-icon-theme:${dotIconName.replace(/_/g, '-')}`
        }
      }
    }

    if (language && materialIcons.languageIds[language]) {
      const iconName = materialIcons.languageIds[language]
      if (materialIcons.iconDefinitions[iconName]) {
        return `i-material-icon-theme:${iconName.replace(/_/g, '-')}`
      }
    }

    return 'i-material-icon-theme:document'
  }
}

interface MaterialIconsData {
  languageMap: LanguageMap
  materialIcons: MaterialIcons
}

interface LanguageMap {
  fileExtensions: Record<string, string>
}

interface MaterialIcons {
  iconDefinitions: Record<string, unknown>
  fileExtensions: Record<string, string>
  fileNames: Record<string, string>
  folderNames: Record<string, string>
  folderNamesExpanded: Record<string, string>
  languageIds: Record<string, string>
}
