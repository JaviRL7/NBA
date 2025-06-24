export interface Team {
  id: number
  abbreviation: string
  full_name: string
}

export interface Player {
  id: number
  first_name: string
  last_name: string
  team: Team
  draft_year: number | null
  image_url?: string
}