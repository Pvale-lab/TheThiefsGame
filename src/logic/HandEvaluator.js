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
  // 1. Correção: Só recusa se não tiver NENHUMA carta
  if (!cards || cards.length === 0) {
    return { rank: 0, name: 'Sem cartas' };
  }

  // 2. Contagem de Facções (Naipes) e Valores
  const factionCounts = {};
  const valueCounts = {};
  
  cards.forEach(card => {
    factionCounts[card.faction] = (factionCounts[card.faction] || 0) + 1;
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  });

  // 3. Extraindo os agrupamentos matemáticos
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  const values = cards.map(c => c.value);
  
  // 4. Checagens exclusivas para 5 ou mais cartas (Flop, Turn, River)
  if (cards.length >= 5) {
    let flushFaction = Object.keys(factionCounts).find(key => factionCounts[key] >= 5);
    const hasFlush = !!flushFaction;
    const hasStraight = checkStraight(values);

    if (hasFlush && hasStraight) {
      const flushCardsValues = cards.filter(c => c.faction === flushFaction).map(c => c.value);
      const isStraightFlush = checkStraight(flushCardsValues);
      
      if (isStraightFlush) {
        const hasRoyal = [1, 10, 11, 12, 13].every(v => flushCardsValues.includes(v));
        if (hasRoyal) return { rank: HAND_RANKINGS.ROYAL_FLUSH, name: 'Royal Flush' };
        
        return { rank: HAND_RANKINGS.STRAIGHT_FLUSH, name: 'Straight Flush' };
      }
    }

    if (counts[0] === 3 && counts[1] >= 2) return { rank: HAND_RANKINGS.FULL_HOUSE, name: 'Full House' };
    if (hasFlush) return { rank: HAND_RANKINGS.FLUSH, name: 'Flush' };
    if (hasStraight) return { rank: HAND_RANKINGS.STRAIGHT, name: 'Sequência' };
  }

  // 5. Checagens que funcionam com 2 a 4 cartas (Pré-Flop e Turn)
  if (counts[0] === 4) return { rank: HAND_RANKINGS.FOUR_OF_A_KIND, name: 'Quadra' };
  if (counts[0] === 3) return { rank: HAND_RANKINGS.THREE_OF_A_KIND, name: 'Trinca' };
  if (counts[0] === 2 && counts[1] === 2) return { rank: HAND_RANKINGS.TWO_PAIR, name: 'Dois Pares' };
  
  // Aqui a mágica de ler um Par nas duas primeiras cartas!
  if (counts[0] === 2) return { rank: HAND_RANKINGS.PAIR, name: 'Um Par' };

  // 6. Carta Alta: Lógica para o Ás (1) ser a carta mais alta, ou pegar o maior número
  const highestValue = values.includes(1) ? 1 : Math.max(...values);
  return { rank: HAND_RANKINGS.HIGH_CARD, name: `Carta Alta (${highestValue})` };
};