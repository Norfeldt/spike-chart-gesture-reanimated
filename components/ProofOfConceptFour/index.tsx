import React, { Component, ReactElement } from 'react'
import { Text, View, Image, Dimensions } from 'react-native'
import {
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Mask,
  Rect,
  G,
  Circle,
  ForeignObject,
  Polygon,
} from 'react-native-svg'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export function SVGLinearGradientMask(props: { children: ReactElement }) {
  return (
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient
          id="Gradient"
          gradientUnits="userSpaceOnUse"
          x1="50%"
          y1="100%"
          x2="50%"
          y2="0%">
          <Stop offset="0" stopColor="rgba(0,0,0,0)" stopOpacity="0" />
          <Stop offset="1" stopColor="white" stopOpacity="1" />
        </LinearGradient>
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

export function ProofOfConceptFour() {
  return (
    <View style={{ flex: 1, backgroundColor: 'tranparent' }}>
      <SVGLinearGradientMask>
        <Polygon points={`0,0 ${SCREEN_WIDTH},50 80,400 0,400`} fill="blue" />
      </SVGLinearGradientMask>
    </View>
  )
}
