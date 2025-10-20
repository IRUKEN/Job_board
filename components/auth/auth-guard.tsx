"use client"

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'

import { configureAmplify } from '@/lib/amplify-client'
import { getCurrentUser } from 'aws-amplify/auth'

type AuthGuardProps = {
  children: ReactNode
  fallbackHref?: string
}

const defaultFallbackHref = '/signin'

export default function AuthGuard({ children, fallbackHref = defaultFallbackHref }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    configureAmplify()

    const checkSession = async () => {
      try {
        await getCurrentUser()
        setIsAuthenticated(true)
      } catch (err) {
        if (err instanceof Error && err.name !== 'UserUnAuthenticatedException') {
          console.error('Error verifying authentication status', err)
          setError('No pudimos validar tu sesión. Vuelve a intentarlo.')
        }
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 border border-gray-200 rounded bg-white shadow-xs">
        <p className="text-sm text-gray-600">Comprobando el estado de tu sesión…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 border border-gray-200 rounded bg-white shadow-xs space-y-3">
        <p className="text-base font-semibold text-gray-800">Inicia sesión para continuar</p>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <p className="text-sm text-gray-600">
          Necesitas una cuenta de AWS Cognito para publicar un nuevo empleo en JobBoard.
        </p>
        <Link className="btn-sm text-white bg-indigo-500 hover:bg-indigo-600 shadow-xs" href={fallbackHref}>
          Ir a la página de inicio de sesión
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
