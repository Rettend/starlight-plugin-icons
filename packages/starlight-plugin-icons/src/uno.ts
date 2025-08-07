import type { Preset } from 'unocss'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { presetIcons } from 'unocss'

function getMaterialIconsSafelist(): string[] {
  try {
    const safelistPath = path.join(process.cwd(), '.material-icons-cache', 'material-icons-safelist.json')
    const safelist = fs.readFileSync(safelistPath, 'utf-8')
    return JSON.parse(safelist)
  }
  catch {
    return []
  }
}

export function presetStarlightIcons(): Preset {
  return {
    name: 'starlight-plugin-icons-preset',
    safelist: getMaterialIconsSafelist(),
    presets: [
      presetIcons({
        collections: {
          icons: {
            'folder': () => {
              const moduleDir = path.dirname(fileURLToPath(import.meta.url))
              const svgPath = path.join(moduleDir, 'assets', 'folder.svg')
              return fsp.readFile(svgPath, 'utf-8')
            },
            'folder-open': () => {
              const moduleDir = path.dirname(fileURLToPath(import.meta.url))
              const svgPath = path.join(moduleDir, 'assets', 'folder-open.svg')
              return fsp.readFile(svgPath, 'utf-8')
            },
          },
        },
      }),
    ],
  }
}
