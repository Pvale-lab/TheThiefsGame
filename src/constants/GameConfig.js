export const FACTIONS = {
  HUMANS: { id: 'humans', name: 'Humanos', color: '#3b82f6', icon: 'shield' },   // Azul
  ELVES: { id: 'elves', name: 'Elfos', color: '#22c55e', icon: 'leaf' },         // Verde
  ORCS: { id: 'orcs', name: 'Orcs', color: '#ef4444', icon: 'axe' },             // Vermelho
  DWARVES: { id: 'dwarves', name: 'Anões', color: '#eab308', icon: 'hammer' }    // Amarelo
};

export const DECK_CONFIG = {
  MIN_VALUE: 1,
  MAX_VALUE: 13,
};

export const GAME_RULES = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 6,
  CARDS_PER_PLAYER: 2,
  SUCCESSES_TO_WIN: 3, // 3 explorações bem-sucedidas
  TRAPS_TO_LOSE: 3,    // 3 armadilhas acionadas
};

export const ROUND_PHASES = {
  PRE_FLOP: 'PRE_FLOP',     // Distribuição das 2 cartas e palpite inicial
  FLOP: 'FLOP',             // 3 cartas comunitárias abertas + chance de trocar palpite
  TURN: 'TURN',             // 1 carta comunitária aberta + chance de trocar palpite
  RIVER: 'RIVER',           // Última carta aberta + palpite final
  REVELATION: 'REVELATION'  // Abertura das mãos e verificação da ordem dos palpites
};

// Aqui deixaremos a hierarquia clássica do Poker já mapeada do menor pro maior peso
export const HAND_RANKINGS = {
  HIGH_CARD: 1,       // Carta Alta
  PAIR: 2,            // Um Par
  TWO_PAIR: 3,        // Dois Pares
  THREE_OF_A_KIND: 4, // Trinca
  STRAIGHT: 5,        // Sequência
  FLUSH: 6,           // Cor (Mesma Facção)
  FULL_HOUSE: 7,      // Full House
  FOUR_OF_A_KIND: 8,  // Quadra
  STRAIGHT_FLUSH: 9,  // Sequência da mesma Facção
  ROYAL_FLUSH: 10     // 10 a 13 da mesma Facção
};