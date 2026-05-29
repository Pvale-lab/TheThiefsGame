import { HAND_RANKINGS } from '../constants/GameConfig';

/**
 * Converte o valor 1 para 14 para fins de cálculo de força (Ás é a carta mais alta).
 */
const getVal = (v) => v === 1 ? 14 : v;

/**
 * Função auxiliar para verificar sequências.
 */
const checkStraight = (values) => {
  let uniqueValues = [...new Set(values)].sort((a, b) => b - a);
  // Se tem um 14 (Ás), adicionamos o 1 no final para permitir a sequência 5-4-3-2-A
  if (uniqueValues.includes(14)) uniqueValues.push(1); 
  
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

export const evaluateHand = (cards) => {
  if (!cards || cards.length === 0) {
    return { rank: 0, name: 'Sem cartas', kickers: [] };
  }

  const factionCounts = {};
  const valueCounts = {};
  
  cards.forEach(card => {
    factionCounts[card.faction] = (factionCounts[card.faction] || 0) + 1;
    const val = getVal(card.value);
    valueCounts[val] = (valueCounts[val] || 0) + 1;
  });

  // MAGIA DO DESEMPATE: Agrupa por frequência e depois por valor.
  // Exemplo: Se tiver um par de 10 e um par de 8, o 10 vem primeiro. 
  // Cartas soltas vêm depois, ordenadas da maior para a menor.
  const groupedValues = Object.entries(valueCounts)
    .map(([val, count]) => ({ val: parseInt(val), count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count; // Mais frequentes primeiro
      return b.val - a.val; // Desempate por valor da carta
    });

  // Monta o array de Kickers com as 5 melhores cartas
  const kickers = [];
  groupedValues.forEach(group => {
    for (let i = 0; i < group.count; i++) {
      if (kickers.length < 5) kickers.push(group.val);
    }
  });

  const counts = groupedValues.map(g => g.count);
  const values = cards.map(c => getVal(c.value));
  
  if (cards.length >= 5) {
    let flushFaction = Object.keys(factionCounts).find(key => factionCounts[key] >= 5);
    const hasFlush = !!flushFaction;
    const hasStraight = checkStraight(values);

    if (hasFlush && hasStraight) {
      const flushCardsValues = cards.filter(c => c.faction === flushFaction).map(c => getVal(c.value));
      const isStraightFlush = checkStraight(flushCardsValues);
      
      if (isStraightFlush) {
        const hasRoyal = [14, 13, 12, 11, 10].every(v => flushCardsValues.includes(v));
        if (hasRoyal) return { rank: HAND_RANKINGS.ROYAL_FLUSH, name: 'Royal Flush', kickers };
        
        return { rank: HAND_RANKINGS.STRAIGHT_FLUSH, name: 'Straight Flush', kickers };
      }
    }

    if (counts[0] === 3 && counts[1] >= 2) return { rank: HAND_RANKINGS.FULL_HOUSE, name: 'Full House', kickers };
    if (hasFlush) return { rank: HAND_RANKINGS.FLUSH, name: 'Flush', kickers };
    if (hasStraight) return { rank: HAND_RANKINGS.STRAIGHT, name: 'Sequência', kickers };
  }

  if (counts[0] === 4) return { rank: HAND_RANKINGS.FOUR_OF_A_KIND, name: 'Quadra', kickers };
  if (counts[0] === 3) return { rank: HAND_RANKINGS.THREE_OF_A_KIND, name: 'Trinca', kickers };
  if (counts[0] === 2 && counts[1] === 2) return { rank: HAND_RANKINGS.TWO_PAIR, name: 'Dois Pares', kickers };
  if (counts[0] === 2) return { rank: HAND_RANKINGS.PAIR, name: 'Um Par', kickers };

  // Retorna a carta alta (voltando 14 para 1 apenas para exibição)
  const highestValue = kickers[0] === 14 ? 1 : kickers[0];
  return { rank: HAND_RANKINGS.HIGH_CARD, name: `Carta Alta (${highestValue})`, kickers };
};

/**
 * Função para comparar duas mãos e decidir qual é mais forte.
 * Retorna 1 se handA vencer, -1 se handB vencer, e 0 se for um empate absoluto.
 */
export const compareHands = (handA, handB) => {
  if (handA.rank > handB.rank) return 1;
  if (handA.rank < handB.rank) return -1;
  
  // Se o Rank for igual (ex: Ambos têm 'Um Par'), desempata pelos Kickers
  for (let i = 0; i < Math.min(handA.kickers.length, handB.kickers.length); i++) {
    if (handA.kickers[i] > handB.kickers[i]) return 1;
    if (handA.kickers[i] < handB.kickers[i]) return -1;
  }
  
  return 0; // Empate absoluto (fichas iguais)
};