"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCurrentUser, signOut } from 'aws-amplify/auth'

import HeaderLogo from '@/components/ui/header-logo'
import { configureAmplify } from '@/lib/amplify-client'

type AuthState = {
  isAuthenticated: boolean
  email?: string
}

export default function Header() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    configureAmplify()

    const loadCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setAuthState({
          isAuthenticated: true,
          email: currentUser.signInDetails?.loginId ?? currentUser.username,
        })
      } catch (err) {
        if (err instanceof Error && err.name !== 'UserUnAuthenticatedException') {
          console.error('Error checking authentication status', err)
          setError('There was a problem validating your session. Sign in again if necessary.')
        }
        setAuthState({ isAuthenticated: false })
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  const handleSignOut = async () => {
    try {
      setError(null)
      await signOut()
      setAuthState({ isAuthenticated: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cerrar la sesión.')
    }
  }

  return (
    <header className="absolute w-full z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Site branding */}
          <div className="shrink-0 mr-4">
            <HeaderLogo />
          </div>

          {/* Desktop navigation */}
          <nav className="flex grow">
            <ul className="flex grow justify-end flex-wrap items-center">
              {authState.isAuthenticated ? (
                <>
                  <li className="hidden sm:block text-sm text-gray-600 px-3 lg:px-5 py-2">
                    {authState.email ? `Hola, ${authState.email}` : 'Sesión iniciada'}
                  </li>
                  <li>
                    <button
                      type="button"
                      className="text-sm font-medium text-indigo-500 hover:underline px-3 lg:px-5 py-2"
                      onClick={handleSignOut}
                      disabled={isLoading}
                    >
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    className="text-sm font-medium text-indigo-500 hover:underline px-3 lg:px-5 py-2 flex items-center"
                    href="/signin"
                  >
                    Sign in
                  </Link>
                </li>
              )}
              <li className="ml-3">
                <Link className="btn-sm text-white bg-indigo-500 hover:bg-indigo-600 w-full shadow-xs" href="/post-a-job">
                  Post a job - $299
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        {error ? (
          <div className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2">
            {error}
          </div>
        ) : null}
      </div>
    </header>
  )
}
