import React, { useState, useEffect } from 'react'
import type { Player } from '../types'
import apiService from '../services/apiService'

interface PlayerSearchProps {
  isActive: boolean
  onPlayerSelect: (player: Player) => void
  selectedCell: string | null
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({ isActive, onPlayerSelect, selectedCell }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedCell) {
      setQuery('')
      setResults([])
      return
    }

    if (query.length < 2) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true)
        const players = await apiService.searchPlayers(query)
        // Limitar a 8 resultados para mejor UX
        setResults(players.slice(0, 8))
      } catch (error) {
        console.error('Error searching players:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, selectedCell])

  const handlePlayerClick = (player: Player) => {
    onPlayerSelect(player)
    setQuery('')
    setResults([])
  }


  return (
    <div style={{ margin: '1rem 0', maxWidth: '800px', width: '100%' }}>
      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={selectedCell ? "Busca un jugador (ej: LeBron James, Stephen Curry...)" : "Selecciona una casilla primero"}
          style={{
            width: '100%',
            padding: '1rem 1.5rem',
            fontSize: '16px',
            border: `2px solid ${selectedCell ? '#d1d5db' : '#e5e7eb'}`,
            borderRadius: '12px',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: selectedCell ? '#ffffff' : '#f9fafb',
            color: selectedCell ? '#000000' : '#9ca3af'
          }}
          onFocus={(e) => {
            if (selectedCell) {
              e.target.style.borderColor = '#3b82f6'
            }
          }}
          onBlur={(e) => {
            if (selectedCell) {
              e.target.style.borderColor = '#d1d5db'
            }
          }}
          disabled={loading || !selectedCell}
        />
        {loading && (
          <div style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #f3f4f6',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(59, 130, 246, 0.15)',
          maxHeight: '320px',
          overflowY: 'auto',
          backdropFilter: 'blur(10px)'
        }}>
          {results.map((player) => (
            <div
              key={player.id}
              onClick={() => handlePlayerClick(player)}
              style={{
                padding: '1.2rem 1.5rem',
                borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                e.currentTarget.style.transform = 'translateX(4px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: '#111827',
                    marginBottom: '4px'
                  }}>
                    {player.first_name} {player.last_name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {player.team?.full_name || 'Unknown Team'}
                    {player.position && ` • ${player.position}`}
                    {player.jersey_number && ` • #${player.jersey_number}`}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#9ca3af',
                  backgroundColor: '#f3f4f6',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  {player.team?.abbreviation || 'UNK'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {query.length >= 2 && !loading && results.length === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
            No se encontraron jugadores para "{query}"
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>
            Intenta con otro nombre
          </div>
        </div>
      )}

      {/* Instructions based on cell selection */}
      <div style={{
        textAlign: 'center',
        marginTop: '1rem',
        fontSize: '14px',
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        {selectedCell ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontWeight: '600',
              color: '#dc2626',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Busca un jugador para la casilla seleccionada
            </span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Selecciona una casilla en el grid para comenzar
          </>
        )}
      </div>
    </div>
  )
}

export default PlayerSearch