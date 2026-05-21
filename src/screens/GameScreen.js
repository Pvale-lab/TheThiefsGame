import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { createDeck, shuffleDeck, dealInitialCards } from '../logic/DeckManager';
import { ROUND_PHASES } from '../constants/GameConfig';

export default function GameScreen({ navigation }) {
  const [hands, setHands] = useState([]);
  const [currentDeck, setCurrentDeck] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [gamePhase, setGamePhase] = useState(null);

  const handleDealCards = () => {
    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    const { playersHands, remainingDeck } = dealInitialCards(shuffledDeck, 4);

    setHands(playersHands);
    setCurrentDeck(remainingDeck);
    setCommunityCards([]); // Limpa a mesa para uma nova rodada
    setGamePhase(ROUND_PHASES.PRE_FLOP);
  };

  const advancePhase = () => {
    let deckCopy = [...currentDeck];
    let newCommunityCards = [...communityCards];

    switch (gamePhase) {
      case ROUND_PHASES.PRE_FLOP:
        // FLOP: Revela 3 cartas
        newCommunityCards.push(deckCopy.pop(), deckCopy.pop(), deckCopy.pop());
        setGamePhase(ROUND_PHASES.FLOP);
        break;
      case ROUND_PHASES.FLOP:
        // TURN: Revela 1 carta
        newCommunityCards.push(deckCopy.pop());
        setGamePhase(ROUND_PHASES.TURN);
        break;
      case ROUND_PHASES.TURN:
        // RIVER: Revela a última carta
        newCommunityCards.push(deckCopy.pop());
        setGamePhase(ROUND_PHASES.RIVER);
        break;
      case ROUND_PHASES.RIVER:
        // REVELAÇÃO: Fim das entregas
        setGamePhase(ROUND_PHASES.REVELATION);
        break;
      default:
        break;
    }

    setCommunityCards(newCommunityCards);
    setCurrentDeck(deckCopy);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mesa de Jogo - The Thiefs</Text>
      
      {gamePhase && (
        <Text style={styles.phaseText}>Fase Atual: {gamePhase}</Text>
      )}

      <View style={styles.buttonContainer}>
        {gamePhase === null || gamePhase === ROUND_PHASES.REVELATION ? (
          <Button title="Nova Rodada" onPress={handleDealCards} />
        ) : (
          <Button title="Avançar Fase (Revelar Cartas)" onPress={advancePhase} color="#f59e0b" />
        )}
      </View>

      {/* Cartas Comunitárias (Mesa) */}
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Cartas Comunitárias</Text>
        <View style={styles.cardsRow}>
          {communityCards.length === 0 && <Text style={styles.info}>Nenhuma carta na mesa ainda.</Text>}
          {communityCards.map((card) => (
            <View key={card.id} style={[styles.card, { borderColor: card.color }]}>
              <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
              <Text style={{ color: card.color, fontSize: 10, fontWeight: 'bold' }}>
                {card.faction.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Mãos dos Jogadores */}
      {hands.map((hand, index) => (
        <View key={index} style={styles.playerContainer}>
          <Text style={styles.playerTitle}>Jogador {index + 1}</Text>
          <View style={styles.cardsRow}>
            {hand.map((card) => (
              <View key={card.id} style={[styles.card, { borderColor: card.color }]}>
                <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
                <Text style={{ color: card.color, fontSize: 10, fontWeight: 'bold' }}>
                  {card.faction.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Button title="Sair do Jogo" onPress={() => navigation.goBack()} color="#ef4444" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', backgroundColor: '#1a1a1a', paddingVertical: 40, paddingHorizontal: 20 },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 10 },
  phaseText: { fontSize: 18, color: '#10b981', fontWeight: 'bold', marginBottom: 20 },
  buttonContainer: { marginBottom: 15, flexDirection: 'row', gap: 10 },
  info: { color: '#aaa', fontSize: 14 },
  
  tableContainer: {
    width: '100%',
    backgroundColor: '#064e3b', // Fundo verde escuro lembrando mesa de poker
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#047857'
  },
  tableTitle: { color: '#fff', fontSize: 18, marginBottom: 15, fontWeight: 'bold' },
  
  playerContainer: { width: '100%', backgroundColor: '#2a2a2a', padding: 15, borderRadius: 8, marginBottom: 15 },
  playerTitle: { color: '#fff', fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  
  cardsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  card: {
    width: 60, height: 90, backgroundColor: '#fff', borderWidth: 3, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 5
  },
  cardValue: { fontSize: 24, fontWeight: 'bold' },
  
  footer: { marginTop: 30, width: '100%' }
});