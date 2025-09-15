// auth-postgresql.js - Backend con PostgreSQL
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')

const app = express()
const PORT = 5000
const JWT_SECRET = 'nba-grid-secret-2025' // En producción usar variable de entorno

// Middleware
app.use(cors())
app.use(express.json())

// Configuración PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nba_grid_db',
  password: 'postgres',
  port: 5432,
})

// Inicializar base de datos
async function initializeDatabase() {
  try {
    // Crear tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        google_id VARCHAR(100) UNIQUE,
        display_name VARCHAR(100),
        avatar_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        games_played INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        best_time INTEGER DEFAULT NULL
      )
    `)

    // Crear tabla de partidas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        grid_data JSONB,
        completed BOOLEAN DEFAULT FALSE,
        completion_time INTEGER DEFAULT NULL,
        date_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de validaciones de jugadores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_validations (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL,
        team_1_id INTEGER NOT NULL,
        team_2_id INTEGER NOT NULL,
        valid BOOLEAN NOT NULL,
        seasons_played TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ PostgreSQL database tables created successfully')
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  }
}

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Rutas de autenticación

// Registro
app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    )

    const user = result.rows[0]

    // Generar JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        gamesPlayed: 0,
        gamesWon: 0
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Login
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]

    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Actualizar último login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id])

    // Generar JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        gamesPlayed: user.games_played,
        gamesWon: user.games_won,
        bestTime: user.best_time
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Perfil del usuario (protegido)
app.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = result.rows[0]

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      gamesPlayed: user.games_played,
      gamesWon: user.games_won,
      bestTime: user.best_time,
      createdAt: user.created_at,
      lastLogin: user.last_login
    })

  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

// Validar jugador para el grid (NUEVA FUNCIÓN CRÍTICA)
app.post('/game/validate-player', authenticateToken, async (req, res) => {
  const { playerId, team1Id, team2Id } = req.body

  if (!playerId || !team1Id || !team2Id) {
    return res.status(400).json({ error: 'Player ID and both team IDs are required' })
  }

  try {
    // Buscar en caché de validaciones
    const cachedValidation = await pool.query(
      'SELECT * FROM player_validations WHERE player_id = $1 AND team_1_id = $2 AND team_2_id = $3',
      [playerId, team1Id, team2Id]
    )

    if (cachedValidation.rows.length > 0) {
      return res.json({
        valid: cachedValidation.rows[0].valid,
        cached: true,
        seasons: cachedValidation.rows[0].seasons_played
      })
    }

    // Si no está en caché, hacer validación real
    // Por ahora, implementamos una validación básica
    // En el futuro esto consultaría la API de estadísticas del jugador
    const isValid = await validatePlayerTeams(playerId, team1Id, team2Id)

    // Guardar resultado en caché
    await pool.query(
      'INSERT INTO player_validations (player_id, team_1_id, team_2_id, valid) VALUES ($1, $2, $3, $4)',
      [playerId, team1Id, team2Id, isValid]
    )

    res.json({
      valid: isValid,
      cached: false
    })

  } catch (error) {
    console.error('Validation error:', error)
    res.status(500).json({ error: 'Validation failed' })
  }
})

// Función auxiliar para validar jugador (IMPLEMENTACIÓN BÁSICA)
async function validatePlayerTeams(playerId, team1Id, team2Id) {
  // Por ahora, una validación simple basada en jugadores conocidos
  // En producción esto consultaría APIs reales de estadísticas

  const knownValidPlayers = {
    // LeBron James: Lakers, Heat, Cavaliers
    1: [14, 16, 6], // LAL, MIA, CLE
    // Kevin Durant: Warriors, Nets, Thunder, Suns
    2: [10, 3, 21, 24], // GSW, BKN, OKC, PHX
    // Chris Paul: Suns, Thunder, Rockets, Clippers
    3: [24, 21, 11, 13], // PHX, OKC, HOU, LAC
  }

  const playerTeams = knownValidPlayers[playerId] || []
  return playerTeams.includes(team1Id) && playerTeams.includes(team2Id)
}

// Guardar partida
app.post('/game/save', authenticateToken, async (req, res) => {
  const { gridData, completed, completionTime } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO games (user_id, grid_data, completed, completion_time) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.user.id, JSON.stringify(gridData), completed, completionTime]
    )

    // Si el juego está completado, actualizar estadísticas del usuario
    if (completed) {
      await pool.query(`
        UPDATE users SET
          games_played = games_played + 1,
          games_won = games_won + 1,
          best_time = CASE
            WHEN best_time IS NULL OR $1 < best_time THEN $1
            ELSE best_time
          END
        WHERE id = $2`,
        [completionTime, req.user.id]
      )
    }

    res.json({
      message: 'Game saved successfully',
      gameId: result.rows[0].id
    })

  } catch (error) {
    console.error('Save game error:', error)
    res.status(500).json({ error: 'Failed to save game' })
  }
})

// Leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        username,
        display_name,
        games_won,
        best_time,
        avatar_url
      FROM users
      WHERE games_won > 0
      ORDER BY games_won DESC, best_time ASC
      LIMIT 10
    `)

    res.json(result.rows)

  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({
      status: 'ok',
      service: 'NBA Grid Auth Backend (PostgreSQL)',
      database: 'connected'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'NBA Grid Auth Backend (PostgreSQL)',
      database: 'disconnected',
      error: error.message
    })
  }
})

// Inicializar y arrancar servidor
async function startServer() {
  await initializeDatabase()

  app.listen(PORT, () => {
    console.log(`🔐 NBA Grid Auth Backend (PostgreSQL) running on http://localhost:${PORT}`)
    console.log(`📡 Available endpoints:`)
    console.log(`   - POST /auth/register`)
    console.log(`   - POST /auth/login`)
    console.log(`   - GET /auth/profile (protected)`)
    console.log(`   - POST /game/validate-player (protected)`)
    console.log(`   - POST /game/save (protected)`)
    console.log(`   - GET /leaderboard`)
    console.log(`   - GET /health`)
    console.log(`🐘 Database: PostgreSQL`)
  })
}

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...')
  await pool.end()
  console.log('✅ Database pool closed successfully')
  process.exit(0)
})

startServer().catch(console.error)