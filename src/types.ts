// NBA Grid Types
interface Team {
  id: number
  abbreviation: string
  full_name: string
}

interface Player {
  id: number
  first_name: string
  last_name: string
  team: Team
  position?: string
  height_feet?: number
  height_inches?: number
  weight_pounds?: number
  draft_year?: number
  jersey_number?: number
  headshot_url?: string
}

export type { Team, Player }