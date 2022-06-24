import React from 'react'
import ProofOfConceptOne from './components/ProofOfConceptOne'
import { ProofOfConceptTwo } from './components/ProofOfConceptTwo'
import { ProofOfConceptThree } from './components/ProofOfConceptThree'
import { ProofOfConceptFour } from './components/ProofOfConceptFour'
import { View } from 'react-native'

export default function App() {
  // return <ProofOfConceptOne />
  // return <ProofOfConceptTwo />
  // return <ProofOfConceptThree />
  // return <ProofOfConceptFour />
  return (
    <View style={{ flex: 1, backgroundColor: '#202032' }}>
      <ProofOfConceptThree />
      {/* <ProofOfConceptFour /> */}
    </View>
  )
}
