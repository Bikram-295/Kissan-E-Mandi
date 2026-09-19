import React, { useState } from 'react'
import globalStyles from '../globals'
import images from '../images'
import imageStyles from '../imagestyles'
import { View, StyleSheet, Image, ScrollView, Alert } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'

export default function Register({ navigation }) {
    const [fname, setFname] = useState("")
    const [lname, setLname] = useState("")
    const [ID, setID] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")

    const handleSubmit = () => {
        if (fname != "" && lname != "" && ID != "" && city != "" && state != "") {
            const user = { first_name: fname, last_name: lname, id: ID, city: city, state: state }
            navigation.navigate('switch', { user: user })
        } else {
            Alert.alert("Missing Information", "Please fill in all personal information fields.")
        }
    }

    return (
        <View style={{ ...globalStyles.container, backgroundColor: '#1B4332' }}>
            {/* Background Decorations */}
            <View style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
            
            <View style={{ width: "100%", alignItems: 'center', marginTop: 40, marginBottom: 20 }}>
                <Image source={images['logo']} style={{ width: 160, height: 50 }} resizeMode="contain" />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                <View style={{ marginHorizontal: 20, padding: 24, backgroundColor: 'white', borderRadius: 30, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 }}>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: '#1B4332', marginBottom: 4 }}>Personal Information</Text>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>Step 1 of 3: Details about you</Text>

                    <View style={globalStyles.formField}>
                        <Text style={globalStyles.formLabels}>First Name</Text>
                        <TextInput 
                            mode='outlined' 
                            style={globalStyles.textInput} 
                            value={fname} 
                            onChangeText={(txt) => setFname(txt)} 
                            placeholder="e.g. Rahul"
                            activeOutlineColor="#1B4332"
                            outlineColor="#EEE"
                        />
                    </View>

                    <View style={globalStyles.formField}>
                        <Text style={globalStyles.formLabels}>Last Name</Text>
                        <TextInput 
                            mode='outlined' 
                            style={globalStyles.textInput} 
                            value={lname} 
                            onChangeText={(txt) => setLname(txt)} 
                            placeholder="e.g. Kumar"
                            activeOutlineColor="#1B4332"
                            outlineColor="#EEE"
                        />
                    </View>

                    <View style={globalStyles.formField}>
                        <Text style={globalStyles.formLabels}>City</Text>
                        <TextInput 
                            mode='outlined' 
                            style={globalStyles.textInput} 
                            value={city} 
                            onChangeText={(txt) => setCity(txt)} 
                            placeholder="Enter your city"
                            activeOutlineColor="#1B4332"
                            outlineColor="#EEE"
                        />
                    </View>

                    <View style={globalStyles.formField}>
                        <Text style={globalStyles.formLabels}>State</Text>
                        <TextInput 
                            mode='outlined' 
                            style={globalStyles.textInput} 
                            value={state} 
                            onChangeText={(txt) => setState(txt)} 
                            placeholder="Enter your state"
                            activeOutlineColor="#1B4332"
                            outlineColor="#EEE"
                        />
                    </View>

                    <View style={globalStyles.formField}>
                        <Text style={globalStyles.formLabels}>Kisaan ID / Dealer ID</Text>
                        <TextInput 
                            mode='outlined' 
                            style={globalStyles.textInput} 
                            value={ID} 
                            onChangeText={(txt) => setID(txt)} 
                            placeholder="Enter unique ID"
                            activeOutlineColor="#1B4332"
                            outlineColor="#EEE"
                        />
                    </View>

                    <Button 
                        mode='contained' 
                        style={{ marginTop: 24, borderRadius: 12, backgroundColor: '#1B4332' }} 
                        contentStyle={{ paddingVertical: 10 }}
                        onPress={handleSubmit}
                    >
                        Next Step
                    </Button>

                    <View style={{ flexDirection: "row", justifyContent: 'center', marginTop: 16 }}>
                        <Text style={{ color: '#666', fontSize: 13 }}>Already have an account? </Text>
                        <Text 
                            style={{ color: '#1B4332', fontWeight: 'bold', fontSize: 13 }}
                            onPress={() => navigation.navigate('login')}
                        >
                            Login
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}



