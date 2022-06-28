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
import { ReText } from 'react-native-redash'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SAFE_HORIZONTAL_PADDING = 15
const LABEL_HEIGHT = 100
const LABEL_FONT_SIZE = 42

const LINE_WIDTH = 2
const GRAPH_HEIGHT = 400
const GRAPH_BOTTOM_PADDING = GRAPH_HEIGHT / 4
const GRAPH_DRAW_AREA_HEIGHT = GRAPH_HEIGHT - GRAPH_BOTTOM_PADDING
const LINE_CIRCLE_RADIUS = 5
const LINE_CIRCLE_DIAMETER = LINE_CIRCLE_RADIUS * 2

export const ThemedText = ({ children, style }: { children: string; style?: TextStyle }) => {
  return <Text style={[styles.labelText, style]}>{children}</Text>
}

export function ProofOfConceptThree(props: { data: number[] }) {
  const data = useSharedValue(props.data)
  const dataMax = useDerivedValue(() => Math.max(...data.value))
  const scrollX = useSharedValue(SCREEN_WIDTH - SAFE_HORIZONTAL_PADDING * 2)
  const index = useDerivedValue(() => {
    const inputRange = [SAFE_HORIZONTAL_PADDING, SCREEN_WIDTH - SAFE_HORIZONTAL_PADDING]
    const outputRange = [0, data.value.length - 1]
    const interpolatedIndex = interpolate(scrollX.value, inputRange, outputRange, {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })

    return Math.round(interpolatedIndex)
  }, [scrollX, data])
  const dataValue = useDerivedValue(() => {
    return `${data.value[index.value].toLocaleString()}`
  })
  const labelOpacity = useSharedValue(1)
  const rLabelViewStyle = useAnimatedStyle(() => {
    return {
      opacity: labelOpacity.value,
    }
  }, [])

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      scrollX.value = event.absoluteX

      labelOpacity.value = withTiming(1, { duration: 500 })
    })
    .onUpdate((event) => {
      // labelOpacity.value = 0
      labelOpacity.value = 0.5
      scrollX.value = event.absoluteX
    })
    .onEnd(() => {
      labelOpacity.value = withTiming(1, { duration: 500 })
    })
    .onFinalize((event) => {
      scrollX.value = withDelay(5000, withTiming(SCREEN_WIDTH - 1))

      labelOpacity.value = withDelay(4700, withTiming(0))
      labelOpacity.value = withDelay(5200, withTiming(1))
    })

  return (
    <View style={{ width: '100%', height: GRAPH_HEIGHT + LABEL_HEIGHT }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.container}>
            <Animated.View style={[styles.labelOuterView, rLabelViewStyle]}>
              <ReText
                text={dataValue}
                style={{ fontSize: LABEL_FONT_SIZE, color: 'white', textAlign: 'center' }}></ReText>
            </Animated.View>

            <Animated.View style={[styles.linesView]}>
              {data.value.map((value, i) => {
                const left =
                  interpolate(
                    i,
                    [0, data.value.length - 1],
                    [0, SCREEN_WIDTH - SAFE_HORIZONTAL_PADDING * 2]
                  ) +
                  SAFE_HORIZONTAL_PADDING -
                  LINE_WIDTH / 2
                const height =
                  (value / dataMax.value) * GRAPH_DRAW_AREA_HEIGHT + GRAPH_BOTTOM_PADDING

                const rLineStyle = useAnimatedStyle(() => {
                  return {
                    left,
                    height,
                    opacity: i === index.value ? 1 : 0,
                    position: 'absolute',
                    width: LINE_WIDTH,
                  }
                }, [])

                return (
                  <Animated.View key={`line-${i}`} style={rLineStyle}>
                    <Animated.View
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

              <Animated.View style={styles.graphPolygonView}>
                <SVGLinearGradientMask>
                  <Polygon
                    points={`
                  0,${GRAPH_HEIGHT} 
                  0,${getYPosition({
                    value: data.value[0],
                    dataMaxValue: dataMax.value,
                  })}
                  ${drawPoints(data.value)}
                  ${SCREEN_WIDTH},${getYPosition({
                      value: data.value[data.value.length - 1],
                      dataMaxValue: dataMax.value,
                    })}
                  ${SCREEN_WIDTH},${GRAPH_HEIGHT} 
                  `.replace(/\n/g, ' ')}
                    fill="#4C46C3"
                  />
                </SVGLinearGradientMask>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
  )
}

function getYPosition({
  value,
  dataMaxValue,
  height = GRAPH_DRAW_AREA_HEIGHT,
}: {
  value: number
  dataMaxValue: number
  height?: number
}) {
  return (height - (value / dataMaxValue) * height + LINE_CIRCLE_DIAMETER).toFixed(2)
}

function drawSinglePoint({
  x,
  y,
  numberOfPoints,
  dataMaxValue,
}: {
  x: number
  y: number
  numberOfPoints: number
  dataMaxValue: number
}) {
  return ` ${interpolate(
    x,
    [0, numberOfPoints - 1],
    [SAFE_HORIZONTAL_PADDING, SCREEN_WIDTH - SAFE_HORIZONTAL_PADDING]
  )},${getYPosition({ value: y, dataMaxValue })} `
}

function drawPoints(data: number[]) {
  return data
    .reduce(
      (acc, value, index) =>
        `${acc} ${drawSinglePoint({
          x: index,
          y: value,
          dataMaxValue: Math.max(...data),
          numberOfPoints: data.length,
        })}`,
      ''
    )
    .trim()
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
  graphPolygonView: ViewStyle
}

const styles = StyleSheet.create<Classes>({
  container: {
    flex: 1,
    backgroundColor: 'tranparent',
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
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH,
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
  graphPolygonView: {
    position: 'absolute',
    zIndex: -1,
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: 'tranparent',
  },
})
