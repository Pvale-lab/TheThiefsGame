import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Thiefs</Text>
      <Button 
        title="Iniciar Partida" 
        onPress={() => navigation.navigate('Game')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  title: { fontSize: 32, color: '#fff', marginBottom: 20, fontWeight: 'bold' }
});