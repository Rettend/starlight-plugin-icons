import fs from 'node:fs/promises'
import { presetStarlightIcons } from 'starlight-plugin-icons/uno'
import { defineConfig, presetIcons, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetStarlightIcons(),
    presetIcons({
      collections: {
        icons: {
          drizzle: () => fs.readFile('./src/assets/drizzle.svg', 'utf-8'),
        },
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      customizations: {
        iconCustomizer(collection, icon, props) {
          if (['simple-icons', 'logos'].includes(collection))
            props.transform = 'scale(0.8)'

          if (collection === 'icons') {
            if (icon === 'drizzle')
              props.transform = 'scale(0.8)'
          }
        },
      },
    }),
  ],
})
