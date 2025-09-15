// auth-backend.js - Backend con autenticación y base de datos
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const app = express()
const PORT = 5000
const JWT_SECRET = 'nba-grid-secret-2025' // En producción usar variable de entorno
const GOOGLE_CLIENT_ID = '770836000576-27mvtshe1bu87ssj9a9ipba7i673b4ok.apps.googleusercontent.com'
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

// Middleware
app.use(cors())
app.use(express.json())

// Base de datos SQLite
const dbPath = path.join(__dirname, 'nba_grid_users.db')
const db = new sqlite3.Database(dbPath)

// Crear tabla de usuarios
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password TEXT,
    google_id TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    best_time INTEGER DEFAULT NULL
  )`)

  // Tabla para guardar partidas
  db.run(`CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    grid_data TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completion_time INTEGER DEFAULT NULL,
    date_played DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`)

  console.log('✅ Database tables created successfully')
})

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

// Registro tradicional (username/password)
app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  try {
    // Verificar si el usuario ya existe
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (user) {
        return res.status(409).json({ error: 'Username or email already exists' })
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 12)

      // Crear usuario
      db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' })
          }

          // Generar JWT token
          const token = jwt.sign(
            { id: this.lastID, username, email },
            JWT_SECRET,
            { expiresIn: '7d' }
          )

          res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
              id: this.lastID,
              username,
              email,
              gamesPlayed: 0,
              gamesWon: 0
            }
          })
        }
      )
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Login tradicional
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password)

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      // Actualizar último login
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id])

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
})

// Google OAuth
app.post('/auth/google', async (req, res) => {
  const { id_token } = req.body

  if (!id_token) {
    return res.status(400).json({ error: 'Google ID token is required' })
  }

  try {
    // Verificar el token de Google
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { sub: googleId, email, name, picture } = payload

    // Buscar si el usuario ya existe
    db.get('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email], (err, existingUser) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      if (existingUser) {
        // Usuario existente - actualizar último login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP, display_name = ?, avatar_url = ? WHERE id = ?',
          [name, picture, existingUser.id], (updateErr) => {
            if (updateErr) {
              console.error('Update error:', updateErr)
              return res.status(500).json({ error: 'Failed to update user' })
            }

            // Generar JWT token
            const token = jwt.sign(
              { id: existingUser.id, username: existingUser.username, email: existingUser.email },
              JWT_SECRET,
              { expiresIn: '7d' }
            )

            res.json({
              message: 'Google login successful',
              token,
              user: {
                id: existingUser.id,
                username: existingUser.username,
                email: existingUser.email,
                displayName: name,
                avatarUrl: picture,
                gamesPlayed: existingUser.games_played,
                gamesWon: existingUser.games_won,
                bestTime: existingUser.best_time
              }
            })
          })
      } else {
        // Nuevo usuario - crear cuenta
        const username = email.split('@')[0] // usar parte del email como username

        db.run('INSERT INTO users (username, email, google_id, display_name, avatar_url) VALUES (?, ?, ?, ?, ?)',
          [username, email, googleId, name, picture],
          function(insertErr) {
            if (insertErr) {
              console.error('Insert error:', insertErr)
              return res.status(500).json({ error: 'Failed to create user' })
            }

            // Generar JWT token
            const token = jwt.sign(
              { id: this.lastID, username, email },
              JWT_SECRET,
              { expiresIn: '7d' }
            )

            res.status(201).json({
              message: 'Google account created successfully',
              token,
              user: {
                id: this.lastID,
                username,
                email,
                displayName: name,
                avatarUrl: picture,
                gamesPlayed: 0,
                gamesWon: 0,
                bestTime: null
              }
            })
          }
        )
      }
    })

  } catch (error) {
    console.error('Google auth error:', error)
    res.status(401).json({ error: 'Invalid Google token' })
  }
})

// Rutas protegidas

// Perfil del usuario
app.get('/auth/profile', authenticateToken, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

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
  })
})

// Guardar partida
app.post('/game/save', authenticateToken, (req, res) => {
  const { gridData, completed, completionTime } = req.body

  db.run('INSERT INTO games (user_id, grid_data, completed, completion_time) VALUES (?, ?, ?, ?)',
    [req.user.id, JSON.stringify(gridData), completed, completionTime],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save game' })
      }

      // Si el juego está completado, actualizar estadísticas del usuario
      if (completed) {
        db.run(`UPDATE users SET
          games_played = games_played + 1,
          games_won = games_won + 1,
          best_time = CASE
            WHEN best_time IS NULL OR ? < best_time THEN ?
            ELSE best_time
          END
          WHERE id = ?`,
          [completionTime, completionTime, req.user.id]
        )
      }

      res.json({
        message: 'Game saved successfully',
        gameId: this.lastID
      })
    }
  )
})

// Leaderboard
app.get('/leaderboard', (req, res) => {
  db.all(`SELECT
    username,
    display_name,
    games_won,
    best_time,
    avatar_url
    FROM users
    WHERE games_won > 0
    ORDER BY games_won DESC, best_time ASC
    LIMIT 10`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json(rows)
    }
  )
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NBA Grid Auth Backend',
    database: 'connected'
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🔐 NBA Grid Auth Backend running on http://localhost:${PORT}`)
  console.log(`📡 Available endpoints:`)
  console.log(`   - POST /auth/register`)
  console.log(`   - POST /auth/login`)
  console.log(`   - POST /auth/google ✅`)
  console.log(`   - GET /auth/profile (protected)`)
  console.log(`   - POST /game/save (protected)`)
  console.log(`   - GET /leaderboard`)
  console.log(`   - GET /health`)
  console.log(`📊 Database: ${dbPath}`)
})

// Manejo de cierre limpio
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...')
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err)
    } else {
      console.log('✅ Database closed successfully')
    }
    process.exit(0)
  })
})