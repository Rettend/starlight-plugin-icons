import { z } from 'zod'

export const StarlightIconsOptionsSchema = z
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
  })

export type StarlightIconsOptions = z.input<typeof StarlightIconsOptionsSchema>
