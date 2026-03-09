import 'react-native-url-polyfill/auto';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Cinzel-Regular': require('./assets/fonts/Cinzel-Regular.ttf'),
        });
      } catch (e) {
        console.warn('Font load failed:', e);
      }
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#ffffff', fontSize: 20 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Navigation />
    </GestureHandlerRootView>
  );
}
