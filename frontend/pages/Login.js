import React, { useState } from 'react'
import globalStyles from '../globals'
import imageStyles from '../imagestyles'
import images from '../images'
import { View, Image } from 'react-native'
import { Text, TextInput, Button } from 'react-native-paper'
import { authURL } from '../urls'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({navigation}) {
    const [ID, setID] = useState("")
    const [passwd, setPasswd] = useState("")
    const handleLogin = async () => {
        //navigate to dashboard after logging in and checking whether farmer or dealer
        await AsyncStorage.clear();
        if (ID != "" && passwd != "") {
            try {
                const response = (await axios.post(authURL, { id: ID, password: passwd })).data
                if (response.status !== "success" || !response.access) {
                    alert(response.message || "Login failed")
                    return
                }
                setID("")
                setPasswd("")
                await AsyncStorage.setItem("access", response.access)
                await AsyncStorage.setItem("refresh", response.refresh)
                await AsyncStorage.setItem("id", response.id)
                await AsyncStorage.setItem("username", response.username)
                await AsyncStorage.setItem("city", response.city)
                await AsyncStorage.setItem("state", response.state)
                await AsyncStorage.setItem("dealer_type", response.dealer_type)
                await AsyncStorage.setItem("role", response.role)
                navigation.navigate(response.role === "dealer" ? "ddashboard" : "fdashboard", {id : response.id, name : response.username, city : response.city, dealer_type : response.dealer_type})
            } catch (error) {
                const message = error.response && error.response.data && error.response.data.message
                    ? error.response.data.message
                    : "Login failed. Please check your ID and password."
                alert(message)
            }
        }
    }
    return (
        <View style={{ ...globalStyles.centeredContainer, backgroundColor: '#1B4332' }}>
            <View style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
            <View style={{ position: 'absolute', bottom: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
            
            <View style={{ padding: 24, width: '90%', alignItems: 'center', backgroundColor: 'white', borderRadius: 30, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}>
                <Image source={images['logo']} style={{ width: 180, height: 70, marginBottom: 20 }} resizeMode="contain" />
                <Text style={{ ...globalStyles.title, fontSize: 24, marginBottom: 4 }}>Welcome Back</Text>
                <Text style={{ ...globalStyles.subtitle, fontSize: 14, marginBottom: 30 }}>Access your agricultural hub</Text>
                
                <View style={globalStyles.formField}>
                    <Text style={globalStyles.formLabels}>Kisaan ID / Dealer ID</Text>
                    <TextInput 
                        mode="outlined"
                        style={globalStyles.textInput} 
                        value={ID} 
                        onChangeText={(txt) => setID(txt)} 
                        placeholder='Enter your ID'
                        outlineColor="#EEE"
                        activeOutlineColor="#1B4332"
                    />
                </View>

                <View style={globalStyles.formField}>
                    <Text style={globalStyles.formLabels}>Password</Text>
                    <TextInput 
                        mode="outlined"
                        secureTextEntry
                        style={globalStyles.textInput} 
                        value={passwd} 
                        onChangeText={(txt) => setPasswd(txt)} 
                        placeholder='Enter your password'
                        outlineColor="#EEE"
                        activeOutlineColor="#1B4332"
                    />
                </View>

                <Button 
                    style={{ marginTop: 24, width: '100%', borderRadius: 12, backgroundColor: '#1B4332' }} 
                    contentStyle={{ paddingVertical: 10 }}
                    mode='contained' 
                    onPress={handleLogin}
                >
                    Login to Mandi
                </Button>
                
                <Button 
                    textColor="#1B4332"
                    style={{ marginTop: 12 }}
                    onPress={() => navigation.navigate('register')}
                >
                    Create New Account
                </Button>
            </View>
        </View>
    )
}


