import { View, Text } from 'react-native'
import React from 'react'
import { Header } from '../../components'

const AdhaarScreen = () => {
  return (
    <View>
        <Header title="Aadhaar Submission" canGoBack type='master' shouldRenderRightIcon={false} />
      <Text>AdhaarScreen</Text>
    </View>
  )
}

export default AdhaarScreen