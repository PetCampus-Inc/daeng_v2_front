import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';

interface Props {
  onRefresh?: () => void;
}

// AOS 시스템 글자 크기 설정이 고정 lineHeight 레이아웃을 깨뜨리는 것을 방지 (QA3-198과 동일 정책, iOS 미적용)
const ALLOW_FONT_SCALING = Platform.OS !== 'android';

export default function ErrorScreen({ onRefresh }: Props) {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/not_found.png')} style={styles.image} resizeMode='contain' />
      <Text style={styles.title} allowFontScaling={ALLOW_FONT_SCALING}>
        연결 상태가 원활하지 않아요
      </Text>
      <View style={styles.content}>
        <Text style={styles.text} allowFontScaling={ALLOW_FONT_SCALING}>
          네트워크 연결을 확인하거나
        </Text>
        <Text style={styles.text} allowFontScaling={ALLOW_FONT_SCALING}>
          잠시 후 다시 시도해 주세요.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onRefresh}>
        <Text style={styles.buttonText} allowFontScaling={ALLOW_FONT_SCALING}>
          다시 시도하기
        </Text>
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
    fontFamily: 'SUIT-Heavy',
    fontSize: 20,
    lineHeight: 32,
    color: '#000000',
    marginBottom: 8
  },
  text: {
    fontFamily: 'SUIT-Regular',
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
    fontFamily: 'SUIT-Bold',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center'
  }
});