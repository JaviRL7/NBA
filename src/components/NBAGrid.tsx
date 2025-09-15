import React, { useState, useEffect } from 'react'
import PlayerSearch from './PlayerSearch'
import type { Team, Player } from '../types'
import apiService from '../services/apiService'

// Equipos para el grid (usando IDs reales de Ball Don't Lie)
const ROW_TEAMS: Team[] = [
  { id: 16, abbreviation: 'MIA', full_name: 'Miami Heat' },
  { id: 14, abbreviation: 'LAL', full_name: 'Los Angeles Lakers' },
  { id: 20, abbreviation: 'NYK', full_name: 'New York Knicks' },
]

const COL_TEAMS: Team[] = [
  { id: 10, abbreviation: 'GSW', full_name: 'Golden State Warriors' },
  { id: 2, abbreviation: 'BOS', full_name: 'Boston Celtics' },
  { id: 4, abbreviation: 'CHI', full_name: 'Chicago Bulls' },
]

// Helper function para obtener imagen del jugador
const getNBAHeadshot = (playerId: number): string => {
  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`
}

const NBAGrid: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [placedPlayers, setPlacedPlayers] = useState<{[key: string]: Player}>({})
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string, visible: boolean}>({
    type: 'success',
    message: '',
    visible: false
  })
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }))
    }, 4000)
  }

  const handleImageError = (playerId: number) => {
    setImageErrors(prev => new Set([...prev, playerId]))
  }

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId)
  }

  const handlePlayerSelect = async (player: Player) => {
    if (selectedCell) {
      // Obtener los IDs de los equipos para la casilla seleccionada
      const [rowIndex, colIndex] = selectedCell.split('-').map(Number)
      const rowTeam = ROW_TEAMS[rowIndex]
      const colTeam = COL_TEAMS[colIndex]

      // Validar que el jugador haya jugado en ambos equipos
      const isValid = await validatePlayerSelection(player, rowTeam.id, colTeam.id)

      if (isValid) {
        setPlacedPlayers(prev => ({
          ...prev,
          [selectedCell]: player
        }))
        setSelectedCell(null)
        showNotification('success', `¡Correcto! ${player.first_name} ${player.last_name} ha jugado en ambos equipos`)
      } else {
        showNotification('error', `${player.first_name} ${player.last_name} no ha jugado en ${rowTeam.abbreviation} y ${colTeam.abbreviation}`)
      }
    }
  }

  // Función escalable para validar si un jugador ha jugado en ambos equipos usando APIs
  const validatePlayerSelection = async (player: Player, team1Id: number, team2Id: number): Promise<boolean> => {
    try {
      // Usar el nuevo sistema escalable basado en APIs
      const validationResult = await apiService.validatePlayerSelection(
        player.first_name,
        player.last_name,
        team1Id,
        team2Id
      )

      console.log(`🚀 API-based validation for ${player.first_name} ${player.last_name}:`, validationResult)

      // Si la validación por API falló, devolver false
      if (validationResult.error) {
        console.warn(`⚠️ API validation failed for ${player.first_name} ${player.last_name}:`, validationResult.error)
        return false
      }

      return validationResult.isValid || false

    } catch (error) {
      console.error('Error in API-based validation:', error)
      return false
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%'
    }}>
      {/* Grid */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 100px)',
          gap: '12px',
        }}>
          {/* Header row */}
          <div style={{
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '8px'
          }}>
            <img
              src="/logo3x3.png"
              alt="Grid Logo"
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'contain'
              }}
            />
          </div>
          {COL_TEAMS.map(team => (
            <div
              key={team.id}
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#3b82f6',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {team.abbreviation}
            </div>
          ))}

          {/* Grid cells */}
          {ROW_TEAMS.map((rowTeam, rowIndex) => (
            <React.Fragment key={rowTeam.id}>
              {/* Row header */}
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {rowTeam.abbreviation}
              </div>

              {/* Cells for this row */}
              {COL_TEAMS.map((colTeam, colIndex) => {
                const cellId = `${rowIndex}-${colIndex}`
                const isSelected = selectedCell === cellId
                const player = placedPlayers[cellId]

                return (
                  <div
                    key={cellId}
                    onClick={() => handleCellClick(cellId)}
                    style={{
                      width: '100px',
                      height: '100px',
                      border: isSelected ? '3px solid #3b82f6' : '2px solid #d1d5db',
                      backgroundColor: player ? '#10b981' : (isSelected ? '#dbeafe' : '#f9fafb'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'center',
                      padding: '4px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!player) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.2)'
                        e.currentTarget.style.backgroundColor = '#f0f9ff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!player) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                        e.currentTarget.style.backgroundColor = isSelected ? '#dbeafe' : '#f9fafb'
                      }
                    }}
                  >
                    {player ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        height: '100%',
                        justifyContent: 'center'
                      }}>
                        {!imageErrors.has(player.id) ? (
                          <img
                            src={getNBAHeadshot(player.id)}
                            alt={`${player.first_name} ${player.last_name}`}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid rgba(255,255,255,0.3)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                            onError={() => handleImageError(player.id)}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(255,255,255,0.3)',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'white'
                          }}>
                            {player.first_name.charAt(0)}{player.last_name.charAt(0)}
                          </div>
                        )}
                        <div style={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          textAlign: 'center',
                          lineHeight: '1.1',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }}>
                          {player.first_name}<br/>
                          {player.last_name}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#9ca3af', fontSize: '24px' }}>+</div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Player Search - Siempre visible */}
      <PlayerSearch
        isActive={true}
        onPlayerSelect={handlePlayerSelect}
        selectedCell={selectedCell}
      />

      {/* Notification */}
      {notification.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          background: notification.type === 'success'
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          fontWeight: '600',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          maxWidth: '400px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {notification.type === 'success' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        textAlign: 'center',
        marginTop: '2rem',
        background: 'rgba(255,255,255,0.8)',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        maxWidth: '500px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <h3 style={{
          marginBottom: '1rem',
          color: '#374151',
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: '1.25rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Cómo Jugar
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'start',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: '#3b82f6',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
              flexShrink: 0
            }}>1</div>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Selecciona una casilla</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: '#10b981',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
              flexShrink: 0
            }}>2</div>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Busca jugadores que hayan estado en ambos equipos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: '#f59e0b',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
              flexShrink: 0
            }}>3</div>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Completa las 9 casillas</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NBAGrid