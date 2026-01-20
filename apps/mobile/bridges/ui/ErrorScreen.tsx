import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface Props {
  onRefresh?: () => void;
}

export default function ErrorScreen({ onRefresh }: Props) {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/not_found.png')} style={styles.image} resizeMode='contain' />
      <Text style={styles.title}>연결 상태가 원활하지 않아요</Text>
      <View style={styles.content}>
        <Text style={styles.text}>네트워크 연결을 확인하거나</Text>
        <Text style={styles.text}>잠시 후 다시 시도해 주세요.</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onRefresh}>
        <Text style={styles.buttonText}>다시 시도하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 16
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 20,
    lineHeight: 32,
    color: '#000000',
    fontWeight: '900',
    marginBottom: 8
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000000'
  },
  button: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FF6E0C',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});