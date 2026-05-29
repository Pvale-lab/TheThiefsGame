import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { createDeck, shuffleDeck, dealInitialCards } from '../logic/DeckManager';
import { evaluateHand, compareHands } from '../logic/HandEvaluator';
import { ROUND_PHASES, GAME_RULES } from '../constants/GameConfig';

// Mapeamento de cores das fichas por fase
const TOKEN_COLORS = {
  [ROUND_PHASES.PRE_FLOP]: '#ffffff', // Branca
  [ROUND_PHASES.FLOP]: '#facc15',     // Amarela
  [ROUND_PHASES.TURN]: '#f97316',     // Laranja
  [ROUND_PHASES.RIVER]: '#ef4444',    // Vermelha
};

// Ordem das fases para exibir o histórico
const PHASES_ORDER = [ROUND_PHASES.PRE_FLOP, ROUND_PHASES.FLOP, ROUND_PHASES.TURN, ROUND_PHASES.RIVER];

export default function GameScreen({ navigation }) {
  const [hands, setHands] = useState([]);
  const [currentDeck, setCurrentDeck] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [gamePhase, setGamePhase] = useState(null);
  
  // Agora guardamos um objeto para cada fase
  const [tokensHistory, setTokensHistory] = useState({
    [ROUND_PHASES.PRE_FLOP]: {},
    [ROUND_PHASES.FLOP]: {},
    [ROUND_PHASES.TURN]: {},
    [ROUND_PHASES.RIVER]: {}
  });

  const [gameStats, setGameStats] = useState({ successes: 0, traps: 0 });
  const [roundResult, setRoundResult] = useState(null); 

  const handleDealCards = () => {
    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    const { playersHands, remainingDeck } = dealInitialCards(shuffledDeck, 4);

    setHands(playersHands);
    setCurrentDeck(remainingDeck);
    setCommunityCards([]); 
    
    // Zera o histórico
    setTokensHistory({
      [ROUND_PHASES.PRE_FLOP]: {},
      [ROUND_PHASES.FLOP]: {},
      [ROUND_PHASES.TURN]: {},
      [ROUND_PHASES.RIVER]: {}
    });
    setRoundResult(null);
    setGamePhase(ROUND_PHASES.PRE_FLOP);
  };

  const handleTokenSelect = (playerIndex, tokenValue) => {
    setTokensHistory(prevHistory => {
      // Trabalhamos apenas com as fichas da fase atual
      const currentPhaseTokens = { ...prevHistory[gamePhase] };

      // Sistema de roubo da fase atual
      const currentOwner = Object.keys(currentPhaseTokens).find(key => currentPhaseTokens[key] === tokenValue);
      if (currentOwner !== undefined) {
        delete currentPhaseTokens[currentOwner];
      }

      if (currentPhaseTokens[playerIndex] === tokenValue) {
        delete currentPhaseTokens[playerIndex];
      } else {
        currentPhaseTokens[playerIndex] = tokenValue;
      }

      return { ...prevHistory, [gamePhase]: currentPhaseTokens };
    });
  };

  // O consenso agora checa apenas a fase ATUAL
  const isConsensusReached = gamePhase && tokensHistory[gamePhase] 
    ? Object.keys(tokensHistory[gamePhase]).length === 4 
    : false;

  const advancePhase = () => {
    if (!isConsensusReached) {
      Alert.alert("Consenso Necessário", "Todos os jogadores precisam estar com uma ficha antes de avançar!");
      return;
    }

    let deckCopy = [...currentDeck];
    let newCommunityCards = [...communityCards];

    switch (gamePhase) {
      case ROUND_PHASES.PRE_FLOP:
        newCommunityCards.push(deckCopy.pop(), deckCopy.pop(), deckCopy.pop());
        setGamePhase(ROUND_PHASES.FLOP);
        break;
      case ROUND_PHASES.FLOP:
        newCommunityCards.push(deckCopy.pop());
        setGamePhase(ROUND_PHASES.TURN);
        break;
      case ROUND_PHASES.TURN:
        newCommunityCards.push(deckCopy.pop());
        setGamePhase(ROUND_PHASES.RIVER);
        break;
      case ROUND_PHASES.RIVER:
        resolveRound(); 
        break;
      default:
        break;
    }
    setCommunityCards(newCommunityCards);
    setCurrentDeck(deckCopy);
  };

  const resolveRound = () => {
    if (!isConsensusReached) return;

    setGamePhase(ROUND_PHASES.REVELATION);

    // A avaliação final DEVE usar as fichas da última fase (River)
    const finalTokens = tokensHistory[ROUND_PHASES.RIVER];

    const playersData = hands.map((hand, index) => ({
      index,
      power: evaluateHand([...hand, ...communityCards]),
      token: finalTokens[index]
    }));

    playersData.sort((a, b) => a.token - b.token);

    let isSuccess = true;
    for (let i = 0; i < playersData.length - 1; i++) {
      const result = compareHands(playersData[i].power, playersData[i+1].power);
      if (result > 0) { 
        isSuccess = false;
        break;
      }
    }

    if (isSuccess) {
      setRoundResult('SUCCESS');
      setGameStats(prev => ({ ...prev, successes: prev.successes + 1 }));
    } else {
      setRoundResult('TRAP');
      setGameStats(prev => ({ ...prev, traps: prev.traps + 1 }));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerScore}>
        <Text style={styles.scoreText}>Explorações: <Text style={{color:'#10b981'}}>{gameStats.successes}/{GAME_RULES.SUCCESSES_TO_WIN}</Text></Text>
        <Text style={styles.scoreText}>Armadilhas: <Text style={{color:'#ef4444'}}>{gameStats.traps}/{GAME_RULES.TRAPS_TO_LOSE}</Text></Text>
      </View>
      
      {roundResult && (
        <View style={[styles.resultBanner, { backgroundColor: roundResult === 'SUCCESS' ? '#065f46' : '#7f1d1d' }]}>
          <Text style={styles.resultText}>
            {roundResult === 'SUCCESS' ? 'SUCESSO! O grupo ordenou corretamente.' : 'ARMADILHA! Alguém avaliou mal a mão.'}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {gamePhase === null || gamePhase === ROUND_PHASES.REVELATION ? (
          <Button title="Nova Rodada" onPress={handleDealCards} />
        ) : (
          <Button 
            title={gamePhase === ROUND_PHASES.RIVER ? "Confirmar e Revelar!" : "Confirmar Fichas e Avançar"} 
            onPress={gamePhase === ROUND_PHASES.RIVER ? resolveRound : advancePhase} 
            color={isConsensusReached ? (gamePhase === ROUND_PHASES.RIVER ? "#8b5cf6" : "#f59e0b") : "#52525b"} 
          />
        )}
      </View>

      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Mesa (Fase: {gamePhase || 'Aguardando'})</Text>
        <View style={styles.cardsRow}>
          {communityCards.map((card) => (
            <View key={card.id} style={[styles.card, { borderColor: card.color }]}>
              <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {hands.map((hand, index) => {
        const combinedCards = [...hand, ...communityCards];
        const currentPower = evaluateHand(combinedCards);
        const currentPhaseColor = TOKEN_COLORS[gamePhase] || '#fff';

        return (
          <View key={index} style={styles.playerContainer}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerTitle}>Jogador {index + 1}</Text>
              <Text style={styles.handPowerText}>{currentPower.name}</Text>
            </View>
            
            <View style={styles.cardsRow}>
              {hand.map((card) => (
                <View key={card.id} style={[styles.card, { borderColor: card.color, width: 50, height: 75 }]}>
                  <Text style={[styles.cardValue, { color: card.color, fontSize: 18 }]}>{card.value}</Text>
                </View>
              ))}
            </View>

            {/* HISTÓRICO DE FICHAS */}
            <View style={styles.historyRow}>
              {PHASES_ORDER.map(phase => {
                const hasTokenInPhase = tokensHistory[phase] && tokensHistory[phase][index];
                if (!hasTokenInPhase) return null;
                
                return (
                  <View key={phase} style={[styles.historyToken, { backgroundColor: TOKEN_COLORS[phase] }]}>
                    <Text style={styles.historyTokenText}>{tokensHistory[phase][index]}</Text>
                  </View>
                );
              })}
            </View>

            {/* SELETOR DE FICHAS DA FASE ATUAL */}
            {gamePhase && gamePhase !== ROUND_PHASES.REVELATION && (
              <View style={styles.tokensRow}>
                <Text style={{color: '#fff', marginRight: 10}}>Escolha:</Text>
                {[1, 2, 3, 4].map(token => {
                  const isSelectedByMe = tokensHistory[gamePhase][index] === token;
                  const isSelectedByOther = Object.values(tokensHistory[gamePhase]).includes(token) && !isSelectedByMe;
                  
                  return (
                    <TouchableOpacity 
                      key={token} 
                      style={[
                        styles.tokenButton, 
                        isSelectedByMe ? { backgroundColor: currentPhaseColor, borderColor: currentPhaseColor } : {},
                        isSelectedByOther ? { borderColor: '#52525b', backgroundColor: '#27272a' } : {}
                      ]}
                      onPress={() => handleTokenSelect(index, token)}
                    >
                      <Text style={[
                        styles.tokenText, 
                        isSelectedByMe ? {color: '#000'} : {},
                        isSelectedByOther ? {color: '#52525b'} : {}
                      ]}>{token}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', backgroundColor: '#1a1a1a', paddingVertical: 40, paddingHorizontal: 15 },
  headerScore: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20, backgroundColor: '#2a2a2a', padding: 10, borderRadius: 8 },
  scoreText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultBanner: { width: '100%', padding: 15, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  resultText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  buttonContainer: { marginBottom: 15 },
  
  tableContainer: { width: '100%', backgroundColor: '#064e3b', padding: 15, borderRadius: 8, marginBottom: 20, alignItems: 'center', borderWidth: 2, borderColor: '#047857' },
  tableTitle: { color: '#fff', fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  
  playerContainer: { width: '100%', backgroundColor: '#2a2a2a', padding: 15, borderRadius: 8, marginBottom: 15 },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  playerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  handPowerText: { color: '#fcd34d', fontSize: 12, fontWeight: 'bold', backgroundColor: '#451a03', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  
  cardsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  card: { width: 60, height: 90, backgroundColor: '#fff', borderWidth: 3, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cardValue: { fontSize: 24, fontWeight: 'bold' },

  historyRow: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginBottom: 10, minHeight: 20 },
  historyToken: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' },
  historyTokenText: { fontSize: 12, fontWeight: 'bold', color: '#000' },

  tokensRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5, backgroundColor: '#3f3f46', padding: 8, borderRadius: 8 },
  tokenButton: { width: 35, height: 35, borderRadius: 20, borderWidth: 1, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  tokenText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});