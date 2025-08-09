import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { SidebarInput } from './lib/sidebar'
import { z } from 'zod'

export const StarlightIconsOptionsSchema = z
  .object({
    /**
     * Defines whether the sidebar component is overridden.
     * @default false
     */
    sidebar: z.boolean().default(false),
    /**
     * Defines whether to extract and generate the icon safelist.
     * @default false
     */
    extractSafelist: z.boolean().default(false),
    /**
     * Controls all codeblock-related features: CSS injection and icon hook.
     * @default false
     */
    codeblock: z.boolean().default(false),
  })

export type StarlightIconsOptions = z.input<typeof StarlightIconsOptionsSchema>

export type StarlightUserConfigWithIcons = Omit<StarlightUserConfig, 'sidebar'> & {
  sidebar?: SidebarInput[]
}
