import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { SidebarInput } from './lib/sidebar'
import { z } from 'zod'

export const StarlightIconsOptionsSchema: z.ZodType<{
  sidebar?: boolean
  extractSafelist?: boolean
  codeblock?: boolean
}> = z
  .object({
    /**
     * Defines whether the sidebar component is overridden.
     * @default true
     */
    sidebar: z.boolean().default(true),
    /**
     * Defines whether to extract and generate the icon safelist.
     * @default true
     */
    extractSafelist: z.boolean().default(true),
    /**
     * Controls all codeblock-related features: CSS injection and icon hook.
     * @default true
     */
    codeblock: z.boolean().default(true),
  })

export type StarlightIconsOptions = z.input<typeof StarlightIconsOptionsSchema>

export type StarlightUserConfigWithIcons = Omit<StarlightUserConfig, 'sidebar'> & {
  sidebar?: SidebarInput[]
}
