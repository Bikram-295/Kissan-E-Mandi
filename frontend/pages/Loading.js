import React from 'react'
import images from '../images'
import imageStyles from '../imagestyles'
import { View, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Loading({ navigation }) {
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            const access = await AsyncStorage.getItem("access")
            const role = await AsyncStorage.getItem("role")
            if (access && role === "dealer") {
                navigation.navigate("ddashboard")
            } else if (access && role) {
                navigation.navigate("fdashboard")
            } else {
                navigation.navigate("register")
            }
        }, 3000)
        return () => clearTimeout(timer)
    }, [])
    return (
        <View style={imageStyles.background}>
            <Image source={images["logo"]} style={imageStyles.logo} />
            <Image source={images['farmer']} style={imageStyles.farmer} />
            <Image source={images['barn']} style={imageStyles.barn} />
            <Image source={images['mound']} style={imageStyles.mound} />
            <Image source={images['stackshort']} style={imageStyles.stackshort} />
            <Image source={images['stacktall']} style={imageStyles.stacktall} />
        </View>
    )
}
