import { View, Image, StyleSheet } from 'react-native';

const tombstoneImage = require('../../assets/images/skull_bg.jpg');

export default function GravestoneBanner() {
  return (
    <View style={styles.container}>
      <Image source={tombstoneImage} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    overflow: 'hidden',
    opacity: 0.06,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
