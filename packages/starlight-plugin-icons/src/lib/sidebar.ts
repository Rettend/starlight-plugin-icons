export interface SidebarLinkInput {
  // Starlight sidebar link shape (minimal subset used here)
  label: string
  href?: string
  slug?: string
  attrs?: Record<string, any>
  badge?: any
  icon?: string
}

export interface SidebarGroupInput {
  label: string
  collapsed?: boolean
  badge?: any
  items: SidebarInput[]
}

export type SidebarInput = SidebarLinkInput | SidebarGroupInput

/**
 * Add icons to Starlight sidebar entries by mapping a friendly `icon` property
 * to `attrs["data-icon"]`, which is consumed by the overridden Sidebar component.
 * Keeps unknown fields intact and preserves the original structure.
 *
 * The function is intentionally generic to preserve the caller's type (e.g. Starlight's
 * own sidebar item types) and avoid narrowing to the helper's local types.
 */
export function withSidebarIcons<T>(sidebar: T[]): T[] {
  return (sidebar as any[]).map((entry) => {
    if (entry && typeof entry === 'object' && 'items' in (entry as any)) {
      const group: any = { ...(entry as any) }
      group.items = withSidebarIcons(group.items)
      return group as T
    }

    const link: any = { ...(entry as any) }
    const icon = link.icon as string | undefined
    if (icon) {
      const attrs = { ...(link.attrs || {}) }
      attrs['data-icon'] = icon
      delete link.icon
      link.attrs = attrs
    }
    return link as T
  })
}
