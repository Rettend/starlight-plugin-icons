import { z } from 'zod'

export const StarlightIconsOptionsSchema = z
  .object({
    /**
     * Defines whether the code blocks icons are enabled.
     * @default true
     */
    codeBlocks: z.boolean().default(true),
  })
  .default({})

export type StarlightIconsOptions = z.input<typeof StarlightIconsOptionsSchema>
