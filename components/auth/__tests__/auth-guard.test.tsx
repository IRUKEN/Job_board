import { render, screen, waitFor } from '@testing-library/react'
import AuthGuard from '../auth-guard'

jest.mock('@/lib/amplify-client', () => ({
  configureAmplify: jest.fn(),
}))

const mockGetCurrentUser = jest.fn()

jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}))

describe('AuthGuard', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset()
  })

  it('renders loading state before authentication completes', () => {
    mockGetCurrentUser.mockReturnValue(new Promise(() => {}))

    render(
      <AuthGuard>
        <div>Contenido protegido</div>
      </AuthGuard>
    )

    expect(screen.getByText('Comprobando el estado de tu sesión…')).toBeInTheDocument()
  })

  it('renders children when the user is authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue({ username: 'user-123' })

    render(
      <AuthGuard>
        <div>Contenido protegido</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
    })
  })

  it('renders fallback when the user is not authenticated', async () => {
    const unauthenticatedError = new Error('No session')
    unauthenticatedError.name = 'UserUnAuthenticatedException'
    mockGetCurrentUser.mockRejectedValue(unauthenticatedError)

    render(
      <AuthGuard>
        <div>Contenido protegido</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: 'Ir a la página de inicio de sesión' })).toHaveAttribute(
      'href',
      '/signin'
    )
  })

  it('shows an error message when an unexpected error occurs', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('network down'))

    render(
      <AuthGuard>
        <div>Contenido protegido</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument()
    })
    expect(
      screen.getByText('No pudimos validar tu sesión. Vuelve a intentarlo.')
    ).toBeInTheDocument()
  })
})
