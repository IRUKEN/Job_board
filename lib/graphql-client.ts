import { fetchAuthSession } from 'aws-amplify/auth'

import { configureAmplify } from './amplify-client'

type GraphQLRequestOptions = {
  query: string
  variables?: Record<string, unknown>
}

type GraphQLFormattedError = {
  message: string
}

type GraphQLResponse<T> = {
  data?: T
  errors?: GraphQLFormattedError[]
}

export type { GraphQLRequestOptions }

export class GraphQLClientError extends Error {
  readonly status?: number
  readonly details?: readonly GraphQLFormattedError[]
  readonly cause?: unknown

  constructor(message: string, options: { status?: number; details?: readonly GraphQLFormattedError[]; cause?: unknown } = {}) {
    super(message)
    this.name = 'GraphQLClientError'
    this.status = options.status
    this.details = options.details
    if ('cause' in options) {
      this.cause = options.cause
    }
  }
}

class GraphQLClient {
  constructor(private readonly endpoint: string) {}

  async request<T>({ query, variables }: GraphQLRequestOptions): Promise<T> {
    configureAmplify()

    let bearerToken: string | undefined

    try {
      const session = await fetchAuthSession()
      bearerToken =
        session.tokens?.accessToken?.toString() ?? session.tokens?.idToken?.toString() ?? undefined
    } catch (error) {
      console.warn('GraphQL client could not read the current Cognito session', error)
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`
    }

    let response: Response
    try {
      response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables: variables ?? undefined,
        }),
      })
    } catch (error) {
      throw new GraphQLClientError('No fue posible contactar al endpoint GraphQL configurado.', {
        cause: error,
      })
    }

    let body: GraphQLResponse<T>
    try {
      body = (await response.json()) as GraphQLResponse<T>
    } catch (error) {
      throw new GraphQLClientError('El backend GraphQL devolvió una respuesta inválida.', {
        status: response.status,
        cause: error,
      })
    }

    if (!response.ok) {
      throw new GraphQLClientError(`La solicitud GraphQL falló con el código HTTP ${response.status}.`, {
        status: response.status,
        details: body.errors,
      })
    }

    if (body.errors?.length) {
      throw new GraphQLClientError(body.errors[0]?.message ?? 'El backend GraphQL devolvió errores.', {
        status: response.status,
        details: body.errors,
      })
    }

    if (!body.data) {
      throw new GraphQLClientError('El backend GraphQL no regresó datos en la respuesta.', {
        status: response.status,
      })
    }

    return body.data
  }
}

let cachedClient: GraphQLClient | null = null

export const getGraphQLClient = () => {
  if (cachedClient) {
    return cachedClient
  }

  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT

  if (!endpoint) {
    throw new GraphQLClientError(
      'Configura la variable NEXT_PUBLIC_GRAPHQL_ENDPOINT para utilizar el cliente GraphQL de NestJS.'
    )
  }

  cachedClient = new GraphQLClient(endpoint)
  return cachedClient
}

export const resetGraphQLClient = () => {
  cachedClient = null
}
