import { Amplify } from 'aws-amplify'

let isConfigured = false

const missingEnvError = (name: string) =>
  `Missing required AWS Cognito environment variable: ${name}. Update your .env.local file with a value for ${name}.`

export const configureAmplify = () => {
  if (isConfigured) {
    return
  }

  const region = process.env.NEXT_PUBLIC_COGNITO_REGION
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
  const identityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID

  if (!region) {
    console.error(missingEnvError('NEXT_PUBLIC_COGNITO_REGION'))
    return
  }

  if (!userPoolId) {
    console.error(missingEnvError('NEXT_PUBLIC_COGNITO_USER_POOL_ID'))
    return
  }

  if (!userPoolClientId) {
    console.error(missingEnvError('NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID'))
    return
  }

  Amplify.configure(
    {
      Auth: {
        Cognito: {
          region,
          userPoolId,
          userPoolClientId,
          identityPoolId: identityPoolId || undefined,
          loginWith: {
            email: true,
          },
        },
      },
      ssr: true,
    } as any
  )

  isConfigured = true
}

export const ensureAmplifyConfigured = () => {
  configureAmplify()
}
