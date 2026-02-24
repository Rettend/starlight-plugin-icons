import { presetStarlightIcons } from 'starlight-plugin-icons/uno'
import { defineConfig, presetIcons, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetStarlightIcons(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
})
