declare namespace App {
  type StarlightLocals = import('@astrojs/starlight').StarlightLocals
  interface Locals extends StarlightLocals {}
}

declare namespace StarlightApp {
  interface I18n {
    [key: string]: string
  }
}
