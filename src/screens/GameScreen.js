import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { createDeck, shuffleDeck, dealInitialCards } from '../logic/DeckManager';

export default function GameScreen({ navigation }) {
  const [hands, setHands] = useState([]);
  const [deckSize, setDeckSize] = useState(0);

  const handleDealCards = () => {
    // 1. Cria o baralho
    const newDeck = createDeck();
    
    // 2. Embaralha
    const shuffledDeck = shuffleDeck(newDeck);
    
    // 3. Distribui para 4 jogadores (como teste)
    const { playersHands, remainingDeck } = dealInitialCards(shuffledDeck, 4);

    // 4. Salva no estado para mostrar na tela
    setHands(playersHands);
    setDeckSize(remainingDeck.length);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mesa de Jogo - The Thiefs</Text>

      <View style={styles.buttonContainer}>
        <Button title="Distribuir Cartas (4 Jogadores)" onPress={handleDealCards} />
      </View>

      {deckSize > 0 && (
        <Text style={styles.info}>Cartas restantes no baralho: {deckSize}</Text>
      )}

      {/* Renderiza a mão de cada jogador */}
      {hands.map((hand, index) => (
        <View key={index} style={styles.playerContainer}>
          <Text style={styles.playerTitle}>Jogador {index + 1}</Text>
          <View style={styles.cardsRow}>
            {hand.map((card) => (
              <View key={card.id} style={[styles.card, { borderColor: card.color }]}>
                <Text style={[styles.cardValue, { color: card.color }]}>
                  {card.value}
                </Text>
                <Text style={{ color: card.color, fontSize: 12, fontWeight: 'bold' }}>
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
  container: { 
    flexGrow: 1, 
    alignItems: 'center', 
    backgroundColor: '#1a1a1a',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  title: { 
    fontSize: 24, 
    color: '#fff', 
    fontWeight: 'bold',
    marginBottom: 20 
  },
  buttonContainer: {
    marginBottom: 15,
  },
  info: {
    color: '#aaa',
    marginBottom: 20,
    fontSize: 14,
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  playerTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  card: {
    width: 80,
    height: 120,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    width: '100%',
  }
});