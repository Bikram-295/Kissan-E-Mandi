import React, { useState } from 'react'
import images from '../images'
import { Appbar, List, Menu, Button } from 'react-native-paper'
import { View, StyleSheet, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Navbar({ navigator, setSelected }) {
    const [ham, setHam] = useState(false)
    const handleLogout = async () => {
        await AsyncStorage.clear()
        navigator.navigate("login")
    }
    return (
        <Appbar.Header mode='small' style={navStyles.header}>
            <View style={navStyles.leftSection}>
                <Menu
                    visible={ham}
                    onDismiss={() => setHam(false)}
                    anchor={<Appbar.Action icon="menu" color="white" onPress={() => setHam(true)} />}
                >
                    <Menu.Item onPress={() => { setSelected("Dashboard"); setHam(false); }} title="Dashboard" />
                    <Menu.Item onPress={() => { setSelected("Your crops"); setHam(false); }} title="Your crops" />
                    <Menu.Item onPress={() => { setSelected("New/Pending offers"); setHam(false); }} title="New/Pending offers" />
                    <Menu.Item onPress={() => { setSelected("Your deals"); setHam(false); }} title="Your deals" />
                    <Menu.Item onPress={handleLogout} title="Logout" />
                </Menu>
                <Image source={images['logo']} style={navStyles.logo} resizeMode="contain" />
            </View>
            <Appbar.Action icon="account-circle" color="white" size={32} onPress={() => {}} />
        </Appbar.Header>
    )
}
const navStyles = StyleSheet.create({
    header: {
        backgroundColor: "#1B4332",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        elevation: 4,
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    logo: {
        width: 120,
        height: 40,
        marginLeft: 8,
    },
    menu: {
        backgroundColor: "white",
    },
})