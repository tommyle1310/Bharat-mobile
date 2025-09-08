import { View, Text } from 'react-native'
import React from 'react'
import { Header } from '../../components'

const PanScreen = () => {
  return (
    <View>
        <Header title="Pan Submission" canGoBack type='master' shouldRenderRightIcon={false} />

      <Text>PanScreen</Text>
    </View>
  )
}

export default PanScreen