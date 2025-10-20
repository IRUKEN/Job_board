import { fetchAuthSession } from 'aws-amplify/auth'

type FetchAuthSessionType = typeof fetchAuthSession

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(),
}))

jest.mock('@/lib/amplify-client', () => ({
  configureAmplify: jest.fn(),
}))

describe('GraphQL client', () => {
  const { getGraphQLClient, GraphQLClientError, resetGraphQLClient } = jest.requireActual<
    typeof import('../graphql-client')
  >('../graphql-client')

  const mockedFetchAuthSession = fetchAuthSession as jest.MockedFunction<FetchAuthSessionType>

  beforeEach(() => {
    resetGraphQLClient()
    mockedFetchAuthSession.mockReset()
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT = 'https://api.example.com/graphql'
  })

  afterEach(() => {
    jest.restoreAllMocks()
    ;(global as any).fetch = undefined
  })

  it('adjunta el token de Cognito a la cabecera Authorization', async () => {
    mockedFetchAuthSession.mockResolvedValue({
      tokens: {
        accessToken: { toString: () => 'access-token' },
      },
    } as any)

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          createJobPosting: { id: '123' },
        },
      }),
    }) as unknown as typeof fetch

    const client = getGraphQLClient()

    await client.request({
      query: 'query Test { version }',
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/graphql',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer access-token' }),
      })
    )
  })

  it('lanza un GraphQLClientError cuando la API devuelve errores', async () => {
    mockedFetchAuthSession.mockResolvedValue({ tokens: {} } as any)

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        errors: [{ message: 'Unauthorized' }],
      }),
    }) as unknown as typeof fetch

    const client = getGraphQLClient()

    await expect(
      client.request({
        query: 'query Test { version }',
      })
    ).rejects.toThrow(GraphQLClientError)
  })

  it('requiere definir la variable NEXT_PUBLIC_GRAPHQL_ENDPOINT', () => {
    delete process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT

    expect(() => getGraphQLClient()).toThrow(GraphQLClientError)
  })
})
