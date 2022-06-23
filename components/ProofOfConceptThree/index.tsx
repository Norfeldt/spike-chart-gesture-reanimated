import React from 'react'
import { StyleSheet, View, ViewStyle, Text, TextStyle, Dimensions } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  useDerivedValue,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Polygon, Rect } from 'react-native-svg'

const clamp = (value: number, min: number, max: number) => {
  'worklet'
  return Math.min(Math.max(value, min), max)
}

const DATA = [...new Array(20)].map((_, index) => Math.round(Math.random() * 300 + 150))
const DATA_MAX = Math.max(...DATA)

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TEXT_HEIGHT = 20
const COUNT = DATA.length
const LINE_WIDTH = 2
const LINE_MARGIN = (SCREEN_WIDTH / COUNT - LINE_WIDTH) / 2
const GRAPH_HEIGHT = 200
const STEP = SCREEN_WIDTH / COUNT
const LINE_CIRCLE_RADIUS = 3
const LINE_CIRCLE_DIAMETER = LINE_CIRCLE_RADIUS * 2

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

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      positionX.value = event.absoluteX
    })
    .onFinalize((event) => {
      positionX.value = withDelay(5000, withTiming(SCREEN_WIDTH - 1))
    })

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.labelOuterView}>
          <Animated.View style={[styles.labelInnerView, rLabelInnerViewStyle]}>
            {DATA.map((value, index) => (
              <ThemedText key={index}>{`${value}`}</ThemedText>
            ))}
          </Animated.View>
        </View>

        <View style={[styles.linesView]}>
          {DATA.map((value, i) => {
            const rLineStyle = useAnimatedStyle(() => {
              return {
                opacity: withTiming(i === index.value ? 1 : 0),
              }
            }, [])

            const lineHeight = (value / Math.max(...DATA)) * GRAPH_HEIGHT

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
                <View style={styles.lineCircle} />
                <LinearGradient
                  style={[
                    {
                      height: lineHeight,
                    },
                  ]}
                  colors={['black', 'transparent']}
                />
              </Animated.View>
            )
          })}
          <Svg
            height={GRAPH_HEIGHT}
            width={SCREEN_WIDTH}
            style={{ position: 'absolute', zIndex: -1 }}>
            <Polygon
              points={`${drawPoints(DATA)} ${SCREEN_WIDTH},${getYPosition({
                value: DATA[DATA.length - 1],
              })} ${SCREEN_WIDTH},${GRAPH_HEIGHT} 0,${GRAPH_HEIGHT} 0,${getYPosition({
                value: DATA[0],
              })}`}
              fill="lime"
              stroke="purple"
              strokeWidth="1"
            />
          </Svg>
        </View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.slideView]}></Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  )
}

function getYPosition({
  value,
  maxValue = DATA_MAX,
  height = GRAPH_HEIGHT,
}: {
  value: number
  maxValue?: number
  height?: number
}) {
  return height - (value / maxValue) * height + LINE_CIRCLE_DIAMETER
}

function drawSinglePoint(x: number, y: number) {
  return ` ${x * STEP + STEP / 2},${getYPosition({ value: y })}`
}

function drawPoints(data: number[]) {
  return data.reduce((acc, value, index) => `${acc} ${drawSinglePoint(index, value)}`, '').trim()
}

type Classes = {
  container: ViewStyle
  labelOuterView: ViewStyle
  labelInnerView: ViewStyle
  labelText: TextStyle
  linesView: ViewStyle
  lineView: ViewStyle
  lineCircle: ViewStyle
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
  lineCircle: {
    aspectRatio: 1,
    width: LINE_CIRCLE_DIAMETER,
    borderRadius: LINE_CIRCLE_RADIUS,
    backgroundColor: 'black',
    alignSelf: 'center',
    marginTop: LINE_CIRCLE_RADIUS / 2,
  },
  slideView: {
    backgroundColor: 'tomato',
    width: '100%',
    height: 60,
  },
})
