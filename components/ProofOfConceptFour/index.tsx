import React, { Component } from 'react'
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
} from 'react-native-svg'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export function ProofOfConceptFour() {
  return (
    <View style={{ backgroundColor: 'tomato' }}>
      <Svg width={SCREEN_WIDTH} height="400">
        <Defs>
          <LinearGradient
            id="Gradient"
            gradientUnits="userSpaceOnUse"
            x1={SCREEN_WIDTH / 2}
            y1="400"
            x2={SCREEN_WIDTH / 2}
            y2="0">
            <Stop offset="0" stopColor="white" stopOpacity="0.2" />
            <Stop offset="1" stopColor="white" stopOpacity="1" />
          </LinearGradient>
          <Mask id="Mask" x="0" y="0" width={SCREEN_WIDTH} height="400">
            <Rect x="0" y="0" width={SCREEN_WIDTH} height="400" fill="url(#Gradient)" />
          </Mask>
        </Defs>
        <G mask="url(#Mask)">
          <ForeignObject x={0} y={0} width={SCREEN_WIDTH} height="400">
            <Rect x="0" y="0" width="5000" height="5000" fill="blue" stroke="rgb(0,0,0)" />
          </ForeignObject>
        </G>
      </Svg>
    </View>
  )
}
