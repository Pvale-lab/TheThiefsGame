// src/logic/DeckManager.js
import { FACTIONS, DECK_CONFIG, GAME_RULES } from '../constants/GameConfig';

/**
 * Cria o baralho padrão com 52 cartas baseado nas facções
 */
export const createDeck = () => {
  let deck = [];
  
  // Itera sobre as chaves das facções (HUMANS, ELVES, etc.)
  Object.keys(FACTIONS).forEach(factionKey => {
    for (let value = DECK_CONFIG.MIN_VALUE; value <= DECK_CONFIG.MAX_VALUE; value++) {
      deck.push({
        faction: FACTIONS[factionKey].id,
        color: FACTIONS[factionKey].color,
        value: value,
        id: `${FACTIONS[factionKey].id}-${value}` // ID único, ótimo para a 'key' nas listas do React
      });
    }
  });
  
  return deck;
};

/**
 * Embaralha o deck usando o algoritmo de Fisher-Yates
 */
export const shuffleDeck = (deck) => {
  let shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Distribui as cartas iniciais (2 para cada jogador)
 */
export const dealInitialCards = (deck, numPlayers) => {
  if (numPlayers < GAME_RULES.MIN_PLAYERS || numPlayers > GAME_RULES.MAX_PLAYERS) {
    throw new Error(`O jogo requer entre ${GAME_RULES.MIN_PLAYERS} e ${GAME_RULES.MAX_PLAYERS} jogadores.`);
  }

  // Cria um array vazio para a mão de cada jogador
  let playersHands = Array.from({ length: numPlayers }, () => []);
  let currentDeck = [...deck];

  // Distribui as cartas uma a uma para simular uma mesa real
  for (let round = 0; round < GAME_RULES.CARDS_PER_PLAYER; round++) {
    for (let p = 0; p < numPlayers; p++) {
      playersHands[p].push(currentDeck.pop());
    }
  }

  return { 
    playersHands, 
    remainingDeck: currentDeck 
  };
};