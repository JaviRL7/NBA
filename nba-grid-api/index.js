// nba-grid-api/index.js

const express = require("express")
const cors = require("cors")
const fetch = require("node-fetch") // <-- Importa node-fetch

const app = express()
const PORT = 4000
const API_KEY = "f7f3a884-2696-4e04-a54a-aac01d0ad61c" // tu API key

app.use(cors())

// Obtener lista de equipos
app.get("/teams", async (req, res) => {
  try {
    const response = await fetch("https://api.balldontlie.io/v1/teams", {
      headers: { Authorization: API_KEY },
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Error API /teams:", text)
      return res
        .status(response.status)
        .json({ error: "Error desde la API de equipos", message: text })
    }

    const json = await response.json()
    // La API devuelve { data: [...] }
    return res.json(json.data)
  } catch (err) {
    console.error("Error al obtener equipos:", err)
    return res.status(500).json({ error: "Error interno al obtener equipos" })
  }
})

// Buscar jugadores por nombre
app.get("/players/search", async (req, res) => {
  const name = req.query.name
  if (!name) {
    return res.status(400).json({ error: "Falta parámetro 'name'" })
  }

  try {
    const response = await fetch(
      `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(name)}`,
      { headers: { Authorization: API_KEY } }
    )
    if (!response.ok) {
      const text = await response.text()
      console.error("Error API /players:", text)
      return res
        .status(response.status)
        .json({ error: "Error desde la API de jugadores", message: text })
    }
    const json = await response.json()
    return res.json(json.data)
  } catch (err) {
    console.error("Error al buscar jugador:", err)
    return res.status(500).json({ error: "Error interno al buscar jugador" })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`)
})
