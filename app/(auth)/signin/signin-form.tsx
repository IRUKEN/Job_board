"use client"

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCurrentUser,
  signIn,
  signInWithRedirect,
  SignInOutput,
} from 'aws-amplify/auth'

import { configureAmplify } from '@/lib/amplify-client'

type SignInStep = SignInOutput['nextStep']

const describeNextStep = (nextStep: SignInStep | null) => {
  if (!nextStep) {
    return null
  }

  switch (nextStep.signInStep) {
    case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
      return 'Complete the SMS verification challenge to finish signing in.'
    case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
      return 'Enter the code from your authenticator application to finish signing in.'
    case 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE':
      return 'Check your inbox for a verification code to complete the sign-in process.'
    case 'CONTINUE_SIGN_IN_WITH_EMAIL_CODE':
      return 'Check your email for a confirmation code to continue.'
    case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD':
      return 'You must set a new password before you can sign in.'
    case 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE':
      return 'Complete the configured custom challenge to sign in.'
    default:
      return 'Additional verification is required to finish signing in.'
  }
}

const mapError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to sign in with the supplied credentials. Please try again.'
}

export default function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pendingStep, setPendingStep] = useState<SignInStep | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    configureAmplify()
  }, [])

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        configureAmplify()
        await getCurrentUser()
        setStatus('Ya has iniciado sesión con tu cuenta de JobBoard.')
        setPendingStep(null)
      } catch (err) {
        if (err instanceof Error && err.name !== 'UserUnAuthenticatedException') {
          console.error('Unable to verify existing session', err)
        }
      }
    }

    checkCurrentUser()
  }, [])

  const pendingStepDescription = useMemo(
    () => describeNextStep(pendingStep),
    [pendingStep]
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setStatus(null)
    setPendingStep(null)

    try {
      configureAmplify()

      const result = await signIn({
        username: email.trim(),
        password,
      })

      if (result.isSignedIn) {
        setStatus('Inicio de sesión exitoso. Redirigiendo a la página principal…')
        router.push('/')
        return
      }

      setPendingStep(result.nextStep)
      setStatus(describeNextStep(result.nextStep))
    } catch (err) {
      setError(mapError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleHostedGoogleSignIn = async () => {
    try {
      configureAmplify()
      await signInWithRedirect({
        provider: 'Google',
      })
    } catch (err) {
      setError(mapError(err))
    }
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold font-inter mb-2">Sign in to JobBoard</h1>
        <div className="text-gray-500">
          Utiliza tu email y contraseña de AWS Cognito para acceder.
        </div>
      </div>

      {error ? (
        <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-600 rounded">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="p-4 mb-6 bg-sky-50 border border-sky-200 text-sky-700 rounded">
          {status}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="form-input w-full"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="form-input w-full"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <button
            type="submit"
            className="btn w-full text-white bg-indigo-500 hover:bg-indigo-600 shadow-xs group disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}{' '}
            <span className="tracking-normal text-indigo-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">
              -&gt;
            </span>
          </button>
        </div>
      </form>

      {pendingStepDescription ? (
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded">
          {pendingStepDescription}
        </div>
      ) : null}

      <div className="flex items-center my-6">
        <div className="border-t border-gray-200 grow mr-3" aria-hidden="true" />
        <div className="text-sm text-gray-500 italic">Or</div>
        <div className="border-t border-gray-200 grow ml-3" aria-hidden="true" />
      </div>

      <button
        onClick={handleHostedGoogleSignIn}
        className="btn text-sm text-white bg-rose-500 hover:bg-rose-600 w-full relative flex after:flex-1 group"
        type="button"
      >
        <div className="flex-1 flex items-center">
          <svg className="w-4 h-4 fill-current text-rose-200 shrink-0" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.679 6.545H8.043v3.273h4.328c-.692 2.182-2.401 2.91-4.363 2.91a4.727 4.727 0 1 1 3.035-8.347l2.378-2.265A8 8 0 1 0 8.008 16c4.41 0 8.4-2.909 7.67-9.455Z" />
          </svg>
        </div>
        <span className="flex-auto text-rose-50 pl-3">
          Continue with Google
          <span className="inline-flex tracking-normal text-rose-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">
            -&gt;
          </span>
        </span>
      </button>
    </>
  )
}
