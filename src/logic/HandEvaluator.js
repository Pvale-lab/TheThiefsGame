// src/logic/HandEvaluator.js
import { HAND_RANKINGS } from '../constants/GameConfig';

/**
 * Função auxiliar para verificar sequências.
 * Trata o valor '1' como um Ás (podendo ser 1 ou 14).
 */
const checkStraight = (values) => {
  let uniqueValues = [...new Set(values)].sort((a, b) => b - a);
  
  // Se tem o número 1, ele também pode agir como a carta mais alta (14)
  if (uniqueValues.includes(1)) {
    uniqueValues.unshift(14); // Adiciona 14 no topo
  }

  let consecutiveCount = 1;
  for (let i = 0; i < uniqueValues.length - 1; i++) {
    if (uniqueValues[i] - 1 === uniqueValues[i + 1]) {
      consecutiveCount++;
      if (consecutiveCount >= 5) return true;
    } else {
      consecutiveCount = 1;
    }
  }
  return false;
};

/**
 * Avalia as cartas e retorna a força máxima da mão.
 * @param {Array} cards - Array contendo as cartas do jogador + mesa (ex: 7 cartas)
 * @returns {Object} - Retorna o ranking e o nome da jogada
 */
export const evaluateHand = (cards) => {
  if (!cards || cards.length < 5) {
    return { rank: 0, name: 'Cartas insuficientes' };
  }

  // 1. Contagem de Facções (Naipes) e Valores
  const factionCounts = {};
  const valueCounts = {};
  
  cards.forEach(card => {
    factionCounts[card.faction] = (factionCounts[card.faction] || 0) + 1;
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  });

  // 2. Extraindo os agrupamentos matemáticos
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  const values = cards.map(c => c.value);
  
  // 3. Checagem de Flush (Cor)
  let flushFaction = Object.keys(factionCounts).find(key => factionCounts[key] >= 5);
  const hasFlush = !!flushFaction;

  // 4. Checagem de Straight (Sequência)
  const hasStraight = checkStraight(values);

  // 5. Checagem de Straight Flush e Royal Flush
  if (hasFlush && hasStraight) {
    // Filtramos apenas as cartas da facção do Flush para checar se a sequência está nelas
    const flushCardsValues = cards.filter(c => c.faction === flushFaction).map(c => c.value);
    const isStraightFlush = checkStraight(flushCardsValues);
    
    if (isStraightFlush) {
      // Se tiver 1, 13, 12, 11 e 10 da mesma facção, é Royal Flush
      const hasRoyal = [1, 10, 11, 12, 13].every(v => flushCardsValues.includes(v));
      if (hasRoyal) return { rank: HAND_RANKINGS.ROYAL_FLUSH, name: 'Royal Flush' };
      
      return { rank: HAND_RANKINGS.STRAIGHT_FLUSH, name: 'Straight Flush' };
    }
  }

  // 6. Quadra (Four of a Kind)
  if (counts[0] === 4) return { rank: HAND_RANKINGS.FOUR_OF_A_KIND, name: 'Quadra' };

  // 7. Full House (Trinca + Par)
  if (counts[0] === 3 && counts[1] >= 2) return { rank: HAND_RANKINGS.FULL_HOUSE, name: 'Full House' };

  // 8. Flush e Straight (já calculados, apenas retornando a ordem de força)
  if (hasFlush) return { rank: HAND_RANKINGS.FLUSH, name: 'Flush' };
  if (hasStraight) return { rank: HAND_RANKINGS.STRAIGHT, name: 'Sequência' };

  // 9. Trinca (Three of a Kind)
  if (counts[0] === 3) return { rank: HAND_RANKINGS.THREE_OF_A_KIND, name: 'Trinca' };

  // 10. Dois Pares
  if (counts[0] === 2 && counts[1] === 2) return { rank: HAND_RANKINGS.TWO_PAIR, name: 'Dois Pares' };

  // 11. Um Par
  if (counts[0] === 2) return { rank: HAND_RANKINGS.PAIR, name: 'Um Par' };

  // 12. Carta Alta
  return { rank: HAND_RANKINGS.HIGH_CARD, name: 'Carta Alta' };
};