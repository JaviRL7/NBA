// staticData.js - Datos estáticos como fallback

const staticTeams = [
  { id: 1, abbreviation: 'ATL', full_name: 'Atlanta Hawks' },
  { id: 2, abbreviation: 'BOS', full_name: 'Boston Celtics' },
  { id: 3, abbreviation: 'BKN', full_name: 'Brooklyn Nets' },
  { id: 4, abbreviation: 'CHA', full_name: 'Charlotte Hornets' },
  { id: 5, abbreviation: 'CHI', full_name: 'Chicago Bulls' },
  { id: 6, abbreviation: 'CLE', full_name: 'Cleveland Cavaliers' },
  { id: 7, abbreviation: 'DAL', full_name: 'Dallas Mavericks' },
  { id: 8, abbreviation: 'DEN', full_name: 'Denver Nuggets' },
  { id: 9, abbreviation: 'DET', full_name: 'Detroit Pistons' },
  { id: 10, abbreviation: 'GSW', full_name: 'Golden State Warriors' },
  { id: 11, abbreviation: 'HOU', full_name: 'Houston Rockets' },
  { id: 12, abbreviation: 'IND', full_name: 'Indiana Pacers' },
  { id: 13, abbreviation: 'LAC', full_name: 'LA Clippers' },
  { id: 14, abbreviation: 'LAL', full_name: 'Los Angeles Lakers' },
  { id: 15, abbreviation: 'MEM', full_name: 'Memphis Grizzlies' },
  { id: 16, abbreviation: 'MIA', full_name: 'Miami Heat' },
  { id: 17, abbreviation: 'MIL', full_name: 'Milwaukee Bucks' },
  { id: 18, abbreviation: 'MIN', full_name: 'Minnesota Timberwolves' },
  { id: 19, abbreviation: 'NOP', full_name: 'New Orleans Pelicans' },
  { id: 20, abbreviation: 'NYK', full_name: 'New York Knicks' },
  { id: 21, abbreviation: 'OKC', full_name: 'Oklahoma City Thunder' },
  { id: 22, abbreviation: 'ORL', full_name: 'Orlando Magic' },
  { id: 23, abbreviation: 'PHI', full_name: 'Philadelphia 76ers' },
  { id: 24, abbreviation: 'PHX', full_name: 'Phoenix Suns' },
  { id: 25, abbreviation: 'POR', full_name: 'Portland Trail Blazers' },
  { id: 26, abbreviation: 'SAC', full_name: 'Sacramento Kings' },
  { id: 27, abbreviation: 'SAS', full_name: 'San Antonio Spurs' },
  { id: 28, abbreviation: 'TOR', full_name: 'Toronto Raptors' },
  { id: 29, abbreviation: 'UTA', full_name: 'Utah Jazz' },
  { id: 30, abbreviation: 'WAS', full_name: 'Washington Wizards' }
];

const staticPlayers = [
  // Lakers players
  { id: 1001, first_name: 'LeBron', last_name: 'James', team: { id: 14, abbreviation: 'LAL', full_name: 'Los Angeles Lakers' }, draft_year: 2003 },
  { id: 1002, first_name: 'Anthony', last_name: 'Davis', team: { id: 14, abbreviation: 'LAL', full_name: 'Los Angeles Lakers' }, draft_year: 2012 },
  { id: 1003, first_name: 'Russell', last_name: 'Westbrook', team: { id: 14, abbreviation: 'LAL', full_name: 'Los Angeles Lakers' }, draft_year: 2008 },
  
  // Warriors players  
  { id: 1004, first_name: 'Stephen', last_name: 'Curry', team: { id: 10, abbreviation: 'GSW', full_name: 'Golden State Warriors' }, draft_year: 2009 },
  { id: 1005, first_name: 'Klay', last_name: 'Thompson', team: { id: 10, abbreviation: 'GSW', full_name: 'Golden State Warriors' }, draft_year: 2011 },
  { id: 1006, first_name: 'Draymond', last_name: 'Green', team: { id: 10, abbreviation: 'GSW', full_name: 'Golden State Warriors' }, draft_year: 2012 },
  
  // Celtics players
  { id: 1007, first_name: 'Jayson', last_name: 'Tatum', team: { id: 2, abbreviation: 'BOS', full_name: 'Boston Celtics' }, draft_year: 2017 },
  { id: 1008, first_name: 'Jaylen', last_name: 'Brown', team: { id: 2, abbreviation: 'BOS', full_name: 'Boston Celtics' }, draft_year: 2016 },
  
  // Nets players
  { id: 1009, first_name: 'Kevin', last_name: 'Durant', team: { id: 3, abbreviation: 'BKN', full_name: 'Brooklyn Nets' }, draft_year: 2007 },
  { id: 1010, first_name: 'Kyrie', last_name: 'Irving', team: { id: 3, abbreviation: 'BKN', full_name: 'Brooklyn Nets' }, draft_year: 2011 },
  
  // Heat players
  { id: 1011, first_name: 'Jimmy', last_name: 'Butler', team: { id: 16, abbreviation: 'MIA', full_name: 'Miami Heat' }, draft_year: 2011 },
  { id: 1012, first_name: 'Bam', last_name: 'Adebayo', team: { id: 16, abbreviation: 'MIA', full_name: 'Miami Heat' }, draft_year: 2017 },
  
  // Bucks players
  { id: 1013, first_name: 'Giannis', last_name: 'Antetokounmpo', team: { id: 17, abbreviation: 'MIL', full_name: 'Milwaukee Bucks' }, draft_year: 2013 },
  { id: 1014, first_name: 'Khris', last_name: 'Middleton', team: { id: 17, abbreviation: 'MIL', full_name: 'Milwaukee Bucks' }, draft_year: 2012 },
  
  // 76ers players
  { id: 1015, first_name: 'Joel', last_name: 'Embiid', team: { id: 23, abbreviation: 'PHI', full_name: 'Philadelphia 76ers' }, draft_year: 2014 },
  { id: 1016, first_name: 'James', last_name: 'Harden', team: { id: 23, abbreviation: 'PHI', full_name: 'Philadelphia 76ers' }, draft_year: 2009 },
  
  // Nuggets players
  { id: 1017, first_name: 'Nikola', last_name: 'Jokic', team: { id: 8, abbreviation: 'DEN', full_name: 'Denver Nuggets' }, draft_year: 2015 },
  { id: 1018, first_name: 'Jamal', last_name: 'Murray', team: { id: 8, abbreviation: 'DEN', full_name: 'Denver Nuggets' }, draft_year: 2016 },
  
  // Mavericks players
  { id: 1019, first_name: 'Luka', last_name: 'Doncic', team: { id: 7, abbreviation: 'DAL', full_name: 'Dallas Mavericks' }, draft_year: 2018 },
  { id: 1020, first_name: 'Kristaps', last_name: 'Porzingis', team: { id: 7, abbreviation: 'DAL', full_name: 'Dallas Mavericks' }, draft_year: 2015 },
  
  // Suns players
  { id: 1021, first_name: 'Devin', last_name: 'Booker', team: { id: 24, abbreviation: 'PHX', full_name: 'Phoenix Suns' }, draft_year: 2015 },
  { id: 1022, first_name: 'Chris', last_name: 'Paul', team: { id: 24, abbreviation: 'PHX', full_name: 'Phoenix Suns' }, draft_year: 2005 }
];

function searchStaticPlayers(query) {
  const lowercaseQuery = query.toLowerCase();
  return staticPlayers.filter(player => 
    player.first_name.toLowerCase().includes(lowercaseQuery) ||
    player.last_name.toLowerCase().includes(lowercaseQuery) ||
    `${player.first_name} ${player.last_name}`.toLowerCase().includes(lowercaseQuery)
  );
}

module.exports = {
  staticTeams,
  staticPlayers,
  searchStaticPlayers
};