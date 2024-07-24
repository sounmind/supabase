import { CommandMenuProvider } from '@ui-patterns/Cmdk'
import { ThemeProvider } from 'common'
import { PortalToast } from 'ui'
import { type PropsWithChildren } from 'react'

import SiteLayout from '~/layouts/SiteLayout'
import { AuthContainer } from './auth/auth.client'
import { QueryClientProvider } from './data/queryClient.client'
import { ShortcutPreviewBuild } from './envs/staging.client'
import { SearchWorkerProvider } from './local-search/local-search.client'
import { PageTelemetry } from './telemetry/telemetry.client'
import { ScrollRestoration } from './ui/helpers.scroll.client'
import { ThemeSandbox } from './ui/theme.client'

/**
 * Global providers that wrap the entire app
 */
function GlobalProviders({ children }: PropsWithChildren) {
  return (
    <ShortcutPreviewBuild>
      <QueryClientProvider>
        <AuthContainer>
          <PageTelemetry />
          <ScrollRestoration />
          <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange>
            <SearchWorkerProvider>
              <CommandMenuProvider site="docs">
                <div className="flex flex-col">
                  <SiteLayout>
                    <PortalToast />
                    {children}
                  </SiteLayout>
                  <ThemeSandbox />
                </div>
              </CommandMenuProvider>
            </SearchWorkerProvider>
          </ThemeProvider>
        </AuthContainer>
      </QueryClientProvider>
    </ShortcutPreviewBuild>
  )
}

export { GlobalProviders }
