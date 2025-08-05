import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CACHE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.material-icons-cache')
const VERSION_URL = 'https://raw.githubusercontent.com/Rettend/github-material-icon-theme/main/download/version.txt'
const LANGUAGE_MAP_URL = 'https://raw.githubusercontent.com/Rettend/github-material-icon-theme/main/download/language-map.json'
const MATERIAL_ICONS_URL = 'https://raw.githubusercontent.com/Rettend/github-material-icon-theme/main/download/material-icons.json'

let cachedData = null

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
  }
  catch {
  }
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)

  return response.json()
}

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)

  return response.text()
}

async function getCachedVersion() {
  try {
    const versionFile = path.join(CACHE_DIR, 'version.txt')
    return await fs.readFile(versionFile, 'utf-8')
  }
  catch {
    return null
  }
}

async function setCachedVersion(version) {
  await ensureCacheDir()
  const versionFile = path.join(CACHE_DIR, 'version.txt')
  await fs.writeFile(versionFile, version, 'utf-8')
}

async function getCachedData() {
  try {
    const languageMapFile = path.join(CACHE_DIR, 'language-map.json')
    const materialIconsFile = path.join(CACHE_DIR, 'material-icons.json')

    const [languageMap, materialIcons] = await Promise.all([
      fs.readFile(languageMapFile, 'utf-8').then(JSON.parse),
      fs.readFile(materialIconsFile, 'utf-8').then(JSON.parse),
    ])

    return { languageMap, materialIcons }
  }
  catch {
    return null
  }
}

async function setCachedData(data) {
  await ensureCacheDir()
  const languageMapFile = path.join(CACHE_DIR, 'language-map.json')
  const materialIconsFile = path.join(CACHE_DIR, 'material-icons.json')

  await Promise.all([
    fs.writeFile(languageMapFile, JSON.stringify(data.languageMap, null, 2), 'utf-8'),
    fs.writeFile(materialIconsFile, JSON.stringify(data.materialIcons, null, 2), 'utf-8'),
  ])
}

export async function getMaterialIconsData() {
  if (cachedData)
    return cachedData

  try {
    const [currentVersion, cachedVersion] = await Promise.all([
      fetchText(VERSION_URL).then(v => v.trim()),
      getCachedVersion(),
    ])

    let data
    if (currentVersion === cachedVersion)
      data = await getCachedData()

    if (!data) {
      // eslint-disable-next-line no-console
      console.log('[LANG ICONS] Fetching material icons data...')
      const [languageMap, materialIcons] = await Promise.all([
        fetchJson(LANGUAGE_MAP_URL),
        fetchJson(MATERIAL_ICONS_URL),
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
    console.warn('Failed to fetch material icons data:', error.message)
  }
}

export async function getIconDetails(title, language) {
  if (language === 'sh')
    return null

  const resolver = resolveIcon(title, language)
  const iconClass = await resolver()

  return {
    iconClass,
    language,
  }
}

export function resolveFolderIcon(folderName, isOpen) {
  return async function () {
    const { materialIcons } = await getMaterialIconsData()
    const lowerFolderName = folderName.toLowerCase()

    const iconName = isOpen
      ? materialIcons.folderNamesExpanded[lowerFolderName]
      : materialIcons.folderNames[lowerFolderName]

    if (iconName && materialIcons.iconDefinitions[iconName])
      return `i-material-icon-theme:${iconName.replace(/_/g, '-')}`

    return isOpen ? 'i-icons:folder-open' : 'i-icons:folder'
  }
}

export function resolveIcon(fileName, language) {
  return async function () {
    const { languageMap, materialIcons } = await getMaterialIconsData()

    if (!fileName && !language)
      return null

    if (fileName?.endsWith('.svelte.js'))
      return 'i-icons:svelte-js'
    if (fileName?.endsWith('.svelte.ts'))
      return 'i-icons:svelte-ts'

    function getIconClass(pairs) {
      for (const pair of pairs) {
        if (pair.lookup) {
          const iconName = pair.lookup[pair.key]
          if (iconName && materialIcons.iconDefinitions[iconName])
            return `i-material-icon-theme:${iconName.replace(/_/g, '-')}`
        }
      }
      return null
    }

    if (fileName) {
      const justFileName = fileName.includes('/') ? fileName.split('/').pop() : fileName
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
      if (iconClass)
        return iconClass
    }

    if (language && materialIcons.languageIds[language]) {
      const iconName = materialIcons.languageIds[language]
      if (materialIcons.iconDefinitions[iconName])
        return `i-material-icon-theme:${iconName.replace(/_/g, '-')}`
    }

    return 'i-material-icon-theme:document'
  }
}
