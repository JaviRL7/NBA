// src/components/PlayerSearch.tsx
import { useState, useCallback } from "react"
import AsyncSelect from "react-select/async"
import type { Player } from "../types"

interface Props {
  activeCell: string | null
  onPlayerSelect: (player: Player) => void
}

export default function PlayerSearch({ activeCell, onPlayerSelect }: Props) {
  const [inputValue, setInputValue] = useState("")

  // Carga opciones desde tu API
  const loadOptions = useCallback(
    async (value: string) => {
      if (value.length < 3) return []
      try {
        const res = await fetch(
          `http://localhost:4000/players/search?name=${encodeURIComponent(
            value
          )}`
        )
        const data: Player[] = await res.json()
        return data
          .filter((p) => p.draft_year && p.draft_year >= 2010)
          .map((p) => ({
            value: p.id,
            label: `${p.first_name} ${p.last_name} — ${p.team.full_name}`,
            player: p,
          }))
      } catch {
        return []
      }
    },
    []
  )

  const handleChange = (opt: any) => {
    if (!activeCell) {
      alert("Selecciona primero una casilla.")
      return
    }
    onPlayerSelect(opt.player)
    setInputValue("")
  }

  // Estilos para hacerlo muy grande
  const customStyles = {
    container: (provided: any) => ({
      ...provided,
      width: "100%",
      maxWidth: "800px",
      marginBottom: "3rem",
    }),
    control: (provided: any) => ({
      ...provided,
      minHeight: "4rem",
      fontSize: "1.25rem",
      borderRadius: "1rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }),
    input: (provided: any) => ({
      ...provided,
      fontSize: "1.25rem",
      margin: "0.5rem",
    }),
    menu: (provided: any) => ({
      ...provided,
      fontSize: "1rem",
      borderRadius: "0.75rem",
      overflow: "hidden",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#ebf8ff" : "white",
      color: "#333",
      padding: "1rem",
    }),
  }

  return (
    <div className="flex justify-center">
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        onInputChange={setInputValue}
        inputValue={inputValue}
        onChange={handleChange}
        placeholder="🔍 Busca jugador (draft ≥ 2010)..."
        styles={customStyles}
        noOptionsMessage={() => "Escribe al menos 3 letras..."}
      />
    </div>
  )
}
