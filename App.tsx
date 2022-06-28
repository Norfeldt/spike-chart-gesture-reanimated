import React from 'react'
import { ProofOfConceptThree, ThemedText } from './components/ProofOfConceptThree'
import { Dimensions, FlatList, Pressable, View } from 'react-native'

const yearsInvested = 5
const DATA_ALL: number[] = [...new Array(yearsInvested * 365)].reduce((acc, _value, index) => {
  if (index === 0) {
    return [10000]
  }
  const previousValue = acc[index - 1]
  const value = Math.round(previousValue * 1.008 + (Math.random() - 0.5) * previousValue * 0.08)

  return [...acc, value]
}, [] as number[])

const dataRanges = {
  ALLE: DATA_ALL.reduce(
    (acc, value, index) =>
      index % Math.floor((DATA_ALL.length - 1) / 200) === 0 ? [...acc, value] : acc,
    [] as number[]
  ),
  '1M': DATA_ALL.slice(-30),
  '3M': DATA_ALL.slice(-90),
  '6M': DATA_ALL.slice(-180),
  '1Y': DATA_ALL.slice(-365, -365 + 200), // let's pretend that this is right
  '2Y': DATA_ALL.slice(-365 * 2, -365 * 2 + 200),
} as const

export type DataRangeKeys = keyof typeof dataRanges

const dataRangeKeys = Object.keys(dataRanges) as DataRangeKeys[]

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function App() {
  const [data, setData] = React.useState(dataRanges.ALLE)
  const [dataRangeLabels, setDataRangeLabels] = React.useState<DataRangeKeys[]>(dataRangeKeys)
  const [activeDataRangeLabel, setActiveDataRangeLabel] = React.useState<DataRangeKeys>('ALLE')

  return (
    <View style={{ flex: 1, backgroundColor: '#202032', justifyContent: 'center' }}>
      <ProofOfConceptThree data={data} key={activeDataRangeLabel} />

      <View
        style={{
          backgroundColor: 'tranparent',
        }}>
        <FlatList
          data={dataRangeLabels}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <DataRangeOption
              label={item as DataRangeKeys}
              onPress={(item) => {
                setActiveDataRangeLabel(item as DataRangeKeys)
                setData(dataRanges[item as DataRangeKeys])

                // hack to avoid lagging the UI thread 🦟
                setTimeout(() => {
                  setData(dataRanges[item as DataRangeKeys])
                  setActiveDataRangeLabel(item as DataRangeKeys)
                }, 1000)
              }}
              active={item === activeDataRangeLabel}
            />
          )}
          contentContainerStyle={{ height: 50 }}
          horizontal
        />
      </View>
    </View>
  )
}

function DataRangeOption({
  label,
  onPress,
  active,
}: {
  label: DataRangeKeys
  onPress: (label: string) => void
  active: boolean
}) {
  return (
    <Pressable
      onPress={() => {
        onPress(label)
      }}
      style={{
        width: SCREEN_WIDTH / 4.6,
        maxWidth: 100,
        minWidth: 60,
        justifyContent: 'center',
        backgroundColor: 'tranparent',
      }}>
      <ThemedText style={{ fontSize: 24, color: active ? 'white' : 'gold' }}>{label}</ThemedText>
    </Pressable>
  )
}
