import React, { ReactElement } from 'react'
import { StyleSheet, View, ViewStyle, Text, TextStyle, Dimensions } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  useDerivedValue,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
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

const DATA: number[] = [...new Array(200)].reduce((acc, _value, index) => {
  if (index === 0) {
    return [10000]
  }
  const previousValue = acc[index - 1]
  const value = Math.round(
    previousValue * 1.008 +
      interpolate(Math.random(), [0, 1], [-previousValue * 0.08, previousValue * 0.08])
  )

  return [...acc, value]
}, [] as number[])
const DATA_MAX = Math.max(...DATA)

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SAFE_HORIZONTAL_PADDING = 35
const LABEL_HEIGHT = 100
const LABEL_FONT_SIZE = 42
const COUNT = DATA.length
const LINE_WIDTH = 2
const LINE_MARGIN = ((SCREEN_WIDTH - 2 * SAFE_HORIZONTAL_PADDING) / COUNT - LINE_WIDTH) / 2
const GRAPH_HEIGHT = 400
const GRAPH_BOTTOM_PADDING = GRAPH_HEIGHT / 4
const GRAPH_DRAW_AREA_HEIGHT = GRAPH_HEIGHT - GRAPH_BOTTOM_PADDING
const LINE_CIRCLE_RADIUS = 5
const LINE_CIRCLE_DIAMETER = LINE_CIRCLE_RADIUS * 2

const ThemedText = ({ children, style }: { children: string; style?: TextStyle }) => {
  return <Text style={[styles.labelText, style]}>{children}</Text>
}

export function ProofOfConceptThree() {
  const scrollX = useSharedValue(SCREEN_WIDTH - SAFE_HORIZONTAL_PADDING * 2)
  const index = useDerivedValue(() => {
    const inputRange = [SAFE_HORIZONTAL_PADDING, SCREEN_WIDTH - SAFE_HORIZONTAL_PADDING]
    const outputRange = [0, COUNT - 1]
    const interpolatedIndex = interpolate(scrollX.value, inputRange, outputRange, {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })

    return Math.round(interpolatedIndex)
  })
  const labelTranslateY = useDerivedValue(() => {
    return withTiming(-index.value * LABEL_HEIGHT)
  })

  const rLabelInnerViewStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: labelTranslateY.value }],
    }
  }, [])

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      scrollX.value = event.absoluteX
    })
    .onUpdate((event) => {
      scrollX.value = event.absoluteX
    })
    .onFinalize((event) => {
      scrollX.value = withDelay(5000, withTiming(SCREEN_WIDTH - 1))
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
              const left =
                interpolate(i, [0, COUNT - 1], [0, SCREEN_WIDTH - SAFE_HORIZONTAL_PADDING * 2]) +
                SAFE_HORIZONTAL_PADDING -
                LINE_WIDTH / 2
              const height = (value / DATA_MAX) * GRAPH_DRAW_AREA_HEIGHT + GRAPH_BOTTOM_PADDING

              const rLineStyle = useAnimatedStyle(() => {
                return {
                  left,
                  height,
                  opacity: i === index.value ? 1 : 0,
                  position: 'absolute',
                  width: LINE_WIDTH,
                  marginHorizontal: LINE_MARGIN,
                }
              }, [])

              return (
                <Animated.View key={`line-${i}`} style={rLineStyle}>
                  <View
                    style={{
                      height: GRAPH_HEIGHT - height,
                      backgroundColor: 'transparent',
                    }}
                  />
                  <View style={styles.lineCircle} />
                  <LinearGradient style={{ height }} colors={['white', 'transparent']} />
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
                  points={`
                  0,${GRAPH_HEIGHT} 
                  0,${getYPosition({
                    value: DATA[0],
                  })}
                  ${drawPoints(DATA)}
                  ${SCREEN_WIDTH},${getYPosition({ value: DATA[COUNT - 1] })}
                  ${SCREEN_WIDTH},${GRAPH_HEIGHT} 
                  `.replace(/\n/g, ' ')}
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
  height = GRAPH_DRAW_AREA_HEIGHT,
}: {
  value: number
  maxValue?: number
  height?: number
}) {
  return height - (value / maxValue) * height + LINE_CIRCLE_DIAMETER
}

function drawSinglePoint(x: number, y: number) {
  return ` ${interpolate(
    x,
    [0, COUNT - 1],
    [SAFE_HORIZONTAL_PADDING, SCREEN_WIDTH - SAFE_HORIZONTAL_PADDING]
  )},${getYPosition({ value: y })}`
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
    paddingHorizontal: SAFE_HORIZONTAL_PADDING - LINE_CIRCLE_DIAMETER,
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
