import { useEffect, useState } from "react"
import type { Team, Player } from "../types"
import PlayerSearch from "./PlayerSearch"

// CDN de ESPN para logos NBA (minúsculas)
const getLogo = (abbr: string) =>
  `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${abbr.toLowerCase()}.png`

// Sólo franquicias actuales
const nbaTeamIds: Record<string, number> = {
  ATL: 1610612737, BOS: 1610612738, BKN: 1610612751, CHA: 1610612766,
  CHI: 1610612741, CLE: 1610612739, DAL: 1610612742, DEN: 1610612743,
  DET: 1610612765, GSW: 1610612744, HOU: 1610612745, IND: 1610612754,
  LAC: 1610612746, LAL: 1610612747, MEM: 1610612763, MIA: 1610612748,
  MIL: 1610612749, MIN: 1610612750, NOP: 1610612740, NYK: 1610612752,
  OKC: 1610612760, ORL: 1610612753, PHI: 1610612755, PHX: 1610612756,
  POR: 1610612757, SAC: 1610612758, SAS: 1610612759, TOR: 1610612761,
  UTA: 1610612762, WAS: 1610612764,
}

export default function Grid() {
  const [rowTeams, setRowTeams] = useState<Team[]>([])
  const [colTeams, setColTeams] = useState<Team[]>([])
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [placed, setPlaced] = useState<Record<string, Player>>({})

  useEffect(() => {
    fetch("http://localhost:4000/teams")
      .then((res) => res.json())
      .then((data: Team[]) => {
        const actual = data.filter((t) => nbaTeamIds[t.abbreviation] !== undefined)
        const shuffled = [...actual].sort(() => 0.5 - Math.random())
        setRowTeams(shuffled.slice(0, 3))
        setColTeams(shuffled.slice(3, 6))
      })
      .catch(console.error)
  }, [])

  const handleCellClick = (key: string) => setActiveCell(key)

  const handlePlayerSelect = (p: Player) => {
    if (!activeCell) return alert("Selecciona primero una casilla.")
    const [rId, cId] = activeCell.split("-").map(Number)
    if (p.team.id !== rId && p.team.id !== cId) {
      return alert("Ese jugador no ha jugado en esos equipos.")
    }
    setPlaced((prev) => ({ ...prev, [activeCell]: p }))
    setActiveCell(null)
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Título */}
      <h1 className="text-3xl font-bold text-blue-700">NBA Grid 3×3</h1>

      {/* Buscador */}
      <PlayerSearch
        activeCell={activeCell}
        onPlayerSelect={handlePlayerSelect}
      />

      {/* Grid */}
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg">
        <div className="grid grid-cols-4 grid-rows-4 gap-2">
          {/* Esquina vacía */}
          <div />

          {/* Cabecera de columnas */}
          {colTeams.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-center border border-gray-200 bg-gray-50"
            >
              <img
                src={getLogo(t.abbreviation)}
                alt={t.abbreviation}
                className="h-6 w-auto object-contain"
              />
            </div>
          ))}

          {/* Filas */}
          {rowTeams.map((r) => (
            <div className="contents" key={r.id}>
              {/* Cabecera de fila */}
              <div className="flex items-center justify-center border border-gray-200 bg-gray-50">
                <img
                  src={getLogo(r.abbreviation)}
                  alt={r.abbreviation}
                  className="h-6 w-auto object-contain"
                />
              </div>

              {/* Celdas centrales */}
              {colTeams.map((c) => {
                const key = `${r.id}-${c.id}`
                const p = placed[key]
                return (
                  <div
                    key={key}
                    onClick={() => handleCellClick(key)}
                    className={
                      "w-44 h-44 border border-gray-300 flex flex-col " +
                      "items-center justify-center cursor-pointer bg-gray-50 " +
                      "hover:bg-gray-100 transition " +
                      (activeCell === key ? "ring-2 ring-blue-400" : "")
                    }
                  >
                    {p ? (
                      <>
                        <img
                          src={p.image_url ?? "/player-placeholder.png"}
                          alt={`${p.first_name} ${p.last_name}`}
                          className="w-20 h-20 rounded-full object-cover mb-1"
                        />
                        <p className="text-sm font-medium text-center px-1">
                          {p.first_name} {p.last_name}
                        </p>
                      </>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
