import React from 'react'
import { StyleSheet, View, ViewStyle, Text, TextStyle, Dimensions } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  useDerivedValue,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated'

const clamp = (value: number, min: number, max: number) => {
  'worklet'
  return Math.min(Math.max(value, min), max)
}

const TEXT_HEIGHT = 20
const COUNT = 10
const { width: SCREEN_WIDTH } = Dimensions.get('window')

const ThemedText = ({ children, style }: { children: string; style?: any }) => {
  return <Text style={[styles.labelText, style]}>{children}</Text>
}

export function ProofOfConceptTwo() {
  const positionX = useSharedValue(SCREEN_WIDTH - TEXT_HEIGHT)
  const index = useDerivedValue(() => {
    return Math.floor(positionX.value / (SCREEN_WIDTH / COUNT))
  })
  const translateY = useDerivedValue(() => {
    return withSpring(index.value * TEXT_HEIGHT * -1)
  })

  const rLabelInnerViewStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  }, [])

  const panGesture = Gesture.Pan().onUpdate((event) => {
    positionX.value = event.absoluteX
  })

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.labelOuterView}>
          <Animated.View style={[styles.labelInnerView, rLabelInnerViewStyle]}>
            {[...new Array(COUNT)].map((_, index) => (
              <ThemedText key={index}>{`${index}`}</ThemedText>
            ))}
          </Animated.View>
        </View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.slideView]}></Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  )
}

type Classes = {
  container: ViewStyle
  labelOuterView: ViewStyle
  labelInnerView: ViewStyle
  labelText: TextStyle
  slideView: ViewStyle
}

const styles = StyleSheet.create<Classes>({
  container: {
    flex: 1,
    backgroundColor: '#efefef',
    justifyContent: 'center',
  },
  labelOuterView: {
    borderColor: 'red',
    borderWidth: 1,
    height: TEXT_HEIGHT,
    overflow: 'hidden',
  },
  labelInnerView: {},
  labelText: {
    textAlign: 'center',
    height: TEXT_HEIGHT,
  },
  slideView: {
    backgroundColor: 'tomato',
    width: '100%',
    height: 60,
  },
})
