#!/usr/bin/env python3
"""
NBA-API Service - Alternativa gratuita sin límites de rate
Requiere: pip install nba_api
"""

from nba_api.stats.endpoints import commonteamyears, playercareerstats
from nba_api.stats.static import teams, players
import json
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Cache simple en memoria
cache = {}

def get_all_teams():
    """Obtener todos los equipos NBA actuales"""
    if 'teams' in cache:
        return cache['teams']
    
    try:
        nba_teams = teams.get_teams()
        # Filtrar solo equipos activos actuales (30 equipos)
        active_teams = []
        for team in nba_teams:
            active_teams.append({
                'id': team['id'],
                'abbreviation': team['abbreviation'], 
                'full_name': team['full_name']
            })
        
        cache['teams'] = active_teams
        return active_teams
    except Exception as e:
        print(f"Error getting teams: {e}")
        return []

def search_players(query):
    """Buscar jugadores por nombre"""
    cache_key = f"players_{query.lower()}"
    if cache_key in cache:
        return cache[cache_key]
    
    try:
        # Buscar en la base de datos estática de jugadores
        all_players = players.get_players()
        results = []
        
        query_lower = query.lower()
        for player in all_players:
            full_name = f"{player['first_name']} {player['last_name']}".lower()
            if query_lower in full_name or query_lower in player['first_name'].lower() or query_lower in player['last_name'].lower():
                # Obtener equipo actual (esto puede requerir más llamadas)
                results.append({
                    'id': player['id'],
                    'first_name': player['first_name'],
                    'last_name': player['last_name'],
                    'team': {
                        'id': 0,  # Por ahora, necesitaríamos otra llamada para esto
                        'abbreviation': 'UNK',
                        'full_name': 'Unknown Team'
                    },
                    'draft_year': 2010  # Por defecto
                })
                
                if len(results) >= 10:  # Limitar resultados
                    break
        
        cache[cache_key] = results
        return results
    except Exception as e:
        print(f"Error searching players: {e}")
        return []

@app.route('/nba-api/teams', methods=['GET'])
def api_teams():
    teams_data = get_all_teams()
    return jsonify(teams_data)

@app.route('/nba-api/players/search', methods=['GET'])
def api_players_search():
    query = request.args.get('name', '')
    if len(query) < 2:
        return jsonify([])
    
    players_data = search_players(query)
    return jsonify(players_data)

@app.route('/nba-api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'service': 'nba-api-alternative'})

if __name__ == '__main__':
    print("🏀 NBA-API Service starting on port 4001...")
    print("📡 Endpoints available:")
    print("  - GET /nba-api/teams")
    print("  - GET /nba-api/players/search?name=PLAYER_NAME")
    print("  - GET /nba-api/health")
    app.run(host='0.0.0.0', port=4001, debug=True)