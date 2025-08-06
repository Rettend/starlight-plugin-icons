import type { HookParameters } from 'astro'

export type AstroIntegrationLogger = HookParameters<'astro:config:setup'>['logger']
