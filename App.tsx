import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Dimensions, StyleSheet, View, Text } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { ReText } from 'react-native-redash'

interface AnimatedPosition {
  x: Animated.SharedValue<number>
  y: Animated.SharedValue<number>
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SIZE = 80
const STEPS = 20
const STEP_WIDTH = SCREEN_WIDTH / STEPS
const LINE_WIDTH = STEP_WIDTH

const useFollowAnimatedPosition = ({
  x,
  y,
  data,
}: AnimatedPosition & { data: { value: number[] } }) => {
  const followX = useDerivedValue(() => {
    return x.value
  })

  const followY = useDerivedValue(() => {
    return withSpring(y.value)
  })

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: Math.max(
            Math.min(
              Math.round(followX.value / STEP_WIDTH) * STEP_WIDTH + STEP_WIDTH,
              SCREEN_WIDTH - LINE_WIDTH + STEP_WIDTH / 2
            ),
            0
          ),
        },
      ],
      // height: (SIZE * followX.value) / SCREEN_WIDTH + SIZE,
      height: (data.value[Math.round(followX.value / STEP_WIDTH) + 1] / 100) * 400,
    }
  })

  return { followX, followY, rStyle }
}

export default function App() {
  const DATA = React.useMemo(
    () => [...new Array(STEPS)].map(() => Math.round(Math.random() * 100)),
    []
  )
  const animatedText = useSharedValue('Some Text')
  const context = useSharedValue({ x: 0, y: 0 })
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const data = useSharedValue(DATA)

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value }
    })
    .onUpdate((event) => {
      const index = Math.round(translateX.value / STEP_WIDTH) + 1

      translateX.value = event.translationX + context.value.x
      translateY.value = event.translationY + context.value.y
      // animatedText.value = `${Math.round(event.absoluteX / STEP_WIDTH) * STEP_WIDTH}`
      animatedText.value = `${data.value[index]} | ${index}`
    })
    .onEnd((event) => {})

  const {
    followX: blueFollowX,
    followY: blueFollowY,
    rStyle: rBlueCircleStyle,
  } = useFollowAnimatedPosition({
    x: translateX,
    y: translateY,
    data,
  })

  const tabGesture = Gesture.Tap().onTouchesDown((event) => {
    translateX.value = withTiming(event.allTouches[0].absoluteX - 2 * STEP_WIDTH)
  })

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: 40,
          }}>
          {DATA.map((value, index) => (
            <Text key={index} style={{ width: STEP_WIDTH, textAlign: 'center' }}>
              {value}
            </Text>
          ))}
        </View>

        <ReText text={animatedText} />
        <View style={{ borderColor: 'red', borderWidth: 1, height: 400 }}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
            }}>
            {DATA.map((value, index) => (
              <View
                key={index + 'bar'}
                style={{
                  height: (value / 100) * 400,
                  width: STEP_WIDTH - 2,
                  backgroundColor: 'tomato',
                  borderWidth: 1,
                  borderColor: 'black',
                }}
              />
            ))}
          </View>
          <GestureDetector gesture={tabGesture}>
            <Animated.View
              style={{
                position: 'absolute',
                width: SCREEN_WIDTH,
                borderColor: 'green',
                borderWidth: 1,
                height: 400,
              }}>
              <GestureDetector gesture={gesture}>
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: SCREEN_WIDTH,
                    borderColor: 'green',
                    borderWidth: 1,
                    height: 400,
                  }}>
                  <Animated.View style={[styles.line, rBlueCircleStyle]} />
                </Animated.View>
              </GestureDetector>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  line: {
    position: 'absolute',
    height: SIZE,
    width: LINE_WIDTH,
    backgroundColor: 'black',
  },
})
