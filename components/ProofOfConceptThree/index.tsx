import React, { ReactElement } from 'react'
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
import Svg, {
  Defs,
  Polygon,
  Rect,
  LinearGradient as SVGLinearGradient,
  Stop,
  Mask,
  G,
  ForeignObject,
} from 'react-native-svg'

const clamp = (value: number, min: number, max: number) => {
  'worklet'
  return Math.min(Math.max(value, min), max)
}

const DATA = [...new Array(30)].map((_, index) =>
  Math.round(Math.random() * 50_000 * 1.02 ** index)
)
const DATA_MAX = Math.max(...DATA)

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const LABEL_HEIGHT = 100
const LABEL_FONT_SIZE = 42
const COUNT = DATA.length
const LINE_WIDTH = 2
const LINE_MARGIN = (SCREEN_WIDTH / COUNT - LINE_WIDTH) / 2
const GRAPH_HEIGHT = 400
const GRAPH_BOTTOM_PADDING = GRAPH_HEIGHT / 4
const GRAPH_DRAW_AREA = GRAPH_HEIGHT - GRAPH_BOTTOM_PADDING
const STEP = SCREEN_WIDTH / COUNT
const LINE_CIRCLE_RADIUS = 5
const LINE_CIRCLE_DIAMETER = LINE_CIRCLE_RADIUS * 2

const ThemedText = ({ children, style }: { children: string; style?: TextStyle }) => {
  return <Text style={[styles.labelText, style]}>{children}</Text>
}

export function ProofOfConceptThree() {
  const positionX = useSharedValue(SCREEN_WIDTH - 1)
  const index = useDerivedValue(() => {
    return Math.floor(positionX.value / STEP)
  })
  const translateY = useDerivedValue(() => {
    return withTiming(-index.value * LABEL_HEIGHT)
  })

  const rLabelInnerViewStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  }, [])

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      console.log('onUpdate', index.value)
      positionX.value = event.absoluteX
    })
    .onFinalize((event) => {
      positionX.value = withDelay(5000, withTiming(SCREEN_WIDTH - 1))
    })

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.container}>
          <View style={styles.labelOuterView}>
            {DATA.map((value, index) => (
              <Animated.View
                key={`labelView-${index}`}
                style={[styles.labelInnerView, rLabelInnerViewStyle]}>
                <ThemedText style={{ fontSize: LABEL_FONT_SIZE / 2 }}>{`${index}`}</ThemedText>
                <ThemedText>{`${value.toLocaleString()}`}</ThemedText>
              </Animated.View>
            ))}
          </View>

          <View style={[styles.linesView]}>
            {DATA.map((value, i) => {
              const rLineStyle = useAnimatedStyle(() => {
                return {
                  opacity: withTiming(i === index.value ? 1 : 0),
                }
              }, [])

              const lineHeight =
                (value / Math.max(...DATA)) * GRAPH_DRAW_AREA + GRAPH_BOTTOM_PADDING

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
                    colors={['white', 'transparent']}
                  />
                </Animated.View>
              )
            })}
            <View
              style={{
                position: 'absolute',
                zIndex: -1,
                width: SCREEN_WIDTH,
                height: 400,
                backgroundColor: 'tranparent',
              }}>
              <SVGLinearGradientMask>
                <Polygon
                  points={`${drawPoints(DATA)} ${SCREEN_WIDTH},${getYPosition({
                    value: DATA[DATA.length - 1],
                  })} ${SCREEN_WIDTH},${GRAPH_HEIGHT} 0,${GRAPH_HEIGHT} 0,${getYPosition({
                    value: DATA[0],
                  })}`}
                  fill="#4C46C3"
                />
              </SVGLinearGradientMask>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

function getYPosition({
  value,
  maxValue = DATA_MAX,
  height = GRAPH_DRAW_AREA,
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

export function SVGLinearGradientMask(props: { children: ReactElement }) {
  return (
    <Svg width="100%" height="100%">
      <Defs>
        <SVGLinearGradient
          id="Gradient"
          gradientUnits="userSpaceOnUse"
          x1="50%"
          y1="100%"
          x2="50%"
          y2="50%">
          <Stop offset="0" stopColor="rgba(0,0,0,0)" stopOpacity="0" />
          <Stop offset="1" stopColor="white" stopOpacity="1" />
        </SVGLinearGradient>
        <Mask id="Mask" x="0" y="0" width="100%" height="100%">
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#Gradient)" />
        </Mask>
      </Defs>
      <G mask="url(#Mask)">
        <ForeignObject x={0} y={0} width="100%" height="100%">
          {props.children}
        </ForeignObject>
      </G>
    </Svg>
  )
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
    backgroundColor: 'tranparent',
    justifyContent: 'center',
  },
  labelOuterView: {
    width: '100%',
    height: LABEL_HEIGHT,
    overflow: 'hidden',
  },
  labelInnerView: {
    width: '100%',
    height: LABEL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    width: '100%',
    textAlign: 'center',
    color: 'white',
    fontSize: LABEL_FONT_SIZE,
  },
  linesView: {
    flexDirection: 'row',
    width: SCREEN_WIDTH,
    height: GRAPH_HEIGHT,
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
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: LINE_CIRCLE_RADIUS / 2,
  },
  slideView: {
    backgroundColor: 'tomato',
    width: '100%',
    height: 60,
  },
})
