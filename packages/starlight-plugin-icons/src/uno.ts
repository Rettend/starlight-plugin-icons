import type { PresetFactory } from 'unocss'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'
import { definePreset, presetIcons } from 'unocss'

function getMaterialIconsSafelist(): string[] {
  try {
    console.log('SAFELIST: process.cwd()', process.cwd())

    // Highest priority: explicit path via env var (e.g. set on CI)
    const envPath = process.env.SPI_SAFELIST_PATH
    if (envPath && fs.existsSync(envPath)) {
      const safelist = fs.readFileSync(envPath, 'utf-8')
      console.log('SAFELIST ENV', envPath)
      return JSON.parse(safelist)
    }

    // Primary location: current working directory
    const directPath = path.join(process.cwd(), '.material-icons-cache', 'material-icons-safelist.json')
    if (fs.existsSync(directPath)) {
      const safelist = fs.readFileSync(directPath, 'utf-8')
      console.log('SAFELIST 1', safelist)
      return JSON.parse(safelist)
    }

    // Fallback for monorepos/CI where the working directory may be the repo root.
    // Search for any generated safelist within the repository (excluding node_modules/.git).
    const matches = globSync('**/.material-icons-cache/material-icons-safelist.json', {
      cwd: process.cwd(),
      absolute: true,
      ignore: ['**/node_modules/**', '**/.git/**'],
    })

    if (matches.length > 0) {
      const safelist = fs.readFileSync(matches[0]!, 'utf-8')
      console.log('SAFELIST 2', safelist)
      return JSON.parse(safelist)
    }
  }
  catch {
    // fallthrough to empty list
  }

  return []
}

function loadIcon(iconName: string) {
  return () => {
    const moduleDir = path.dirname(fileURLToPath(import.meta.url))
    const svgPath = path.join(moduleDir, 'assets', `${iconName}.svg`)
    return fsp.readFile(svgPath, 'utf-8')
  }
}

export const presetStarlightIcons: PresetFactory<object, undefined> = definePreset(() => {
  const internalIcons = presetIcons({
    collections: {
      'starlight-plugin-icons': {
        'folder': loadIcon('folder'),
        'folder-open': loadIcon('folder-open'),
        'svelte-js': loadIcon('svelte-js'),
        'svelte-ts': loadIcon('svelte-ts'),
      },
    },
    autoInstall: false,
    extraProperties: {
      'display': 'inline-block',
      'vertical-align': 'middle',
    },
  })

  const internalIconsRenamed = { ...(internalIcons as any), name: 'starlight-plugin-icons-icons' }

  const preset = {
    name: 'starlight-plugin-icons-preset',
    safelist: getMaterialIconsSafelist(),
    presets: [
      internalIconsRenamed as any,
    ],
  }
  return preset
})
