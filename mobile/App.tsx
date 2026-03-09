import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ff0000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '700' }}>HELLO WORLD</Text>
      <Text style={{ color: '#ffffff', fontSize: 18, marginTop: 20 }}>If you see this, the app works!</Text>
    </View>
  );
}
