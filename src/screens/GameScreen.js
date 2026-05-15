import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function GameScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mesa de Jogo (Fase de Desenvolvimento)</Text>
      <Button title="Sair do Jogo" onPress={() => navigation.goBack()} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  text: { color: '#fff', marginBottom: 20 }
});