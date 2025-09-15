import React, { useState, useEffect } from 'react'
import AuthModal from './AuthModal'

interface User {
  id: number
  username: string
  email: string
  gamesPlayed: number
  gamesWon: number
  bestTime?: number
}

interface AuthHeaderProps {
  onUserChange: (user: User | null) => void
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ onUserChange }) => {
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Verificar si hay un token guardado al cargar
  useEffect(() => {
    const token = localStorage.getItem('nba-grid-token')
    if (token) {
      fetchUserProfile(token)
    }
  }, [])

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        const user: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          gamesPlayed: userData.gamesPlayed,
          gamesWon: userData.gamesWon,
          bestTime: userData.bestTime
        }
        setUser(user)
        onUserChange(user)
      } else {
        // Token inválido
        localStorage.removeItem('nba-grid-token')
        setUser(null)
        onUserChange(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      localStorage.removeItem('nba-grid-token')
      setUser(null)
      onUserChange(null)
    }
  }

  const handleAuthSuccess = (userData: User, token: string) => {
    setUser(userData)
    onUserChange(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('nba-grid-token')
    setUser(null)
    onUserChange(null)
    setShowUserMenu(false)
  }

  return (
    <>
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 100
      }}>
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#1f2937',
                  fontSize: '14px'
                }}>
                  {user.username}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {user.gamesWon}/{user.gamesPlayed} ganadas
                </span>
              </div>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                padding: '0.5rem',
                minWidth: '200px',
                zIndex: 1000
              }}>
                <div style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid #f3f4f6',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    {user.username}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {user.email}
                  </div>
                </div>

                <div style={{
                  padding: '0.5rem',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    Partidas jugadas: {user.gamesPlayed}
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    Partidas ganadas: {user.gamesWon}
                  </div>
                  {user.bestTime && (
                    <div>
                      Mejor tiempo: {Math.floor(user.bestTime / 60)}:{(user.bestTime % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginTop: '0.5rem'
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            Iniciar Sesión
          </button>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  )
}

export default AuthHeader