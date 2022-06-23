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

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TEXT_HEIGHT = 20
const COUNT = 10
const LINE_WIDTH = 2
const LINE_MARGIN = (SCREEN_WIDTH / COUNT - LINE_WIDTH) / 2
const GRAPH_HEIGHT = 200
const STEP = SCREEN_WIDTH / COUNT

const ThemedText = ({ children, style }: { children: string; style?: any }) => {
  return <Text style={[styles.labelText, style]}>{children}</Text>
}

export function ProofOfConceptThree() {
  const positionX = useSharedValue(SCREEN_WIDTH - TEXT_HEIGHT)
  const index = useDerivedValue(() => {
    return Math.floor(positionX.value / STEP)
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

        <View style={[styles.linesView]}>
          {[...new Array(COUNT)].map((_, i) => {
            const rLineStyle = useAnimatedStyle(() => {
              return {
                opacity: i === index.value ? 1 : 0,
              }
            }, [])

            const lineHeight = GRAPH_HEIGHT - ((COUNT - i) / COUNT) * GRAPH_HEIGHT

            return (
              <Animated.View key={`line-${i}`} style={[styles.lineView, rLineStyle]}>
                <View
                  style={[
                    {
                      height: GRAPH_HEIGHT - lineHeight,
                      backgroundColor: 'transparent',
                    },
                  ]}
                />
                <View
                  style={[
                    {
                      height: lineHeight,
                      backgroundColor: 'black',
                    },
                  ]}
                />
              </Animated.View>
            )
          })}
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
  linesView: ViewStyle
  lineView: ViewStyle
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
  linesView: {
    flexDirection: 'row',
    width: SCREEN_WIDTH,
    height: GRAPH_HEIGHT,
    borderColor: 'blue',
    borderWidth: 1,
  },
  lineView: {
    width: LINE_WIDTH,
    marginHorizontal: LINE_MARGIN,
    height: 40,
  },
  slideView: {
    backgroundColor: 'tomato',
    width: '100%',
    height: 60,
  },
})
