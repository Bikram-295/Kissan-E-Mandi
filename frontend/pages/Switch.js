import { Image, StyleSheet, TouchableHighlight, View } from 'react-native';
import images from '../images';
import globalStyles from '../globals'
import imageStyles from '../imagestyles';
import { Text, Button } from 'react-native-paper';
import { useState } from 'react';


export default function Splash({ navigation, route }) {
    const [option, setOption] = useState("")
    
    return (
        <View style={styles.container}>
            {/* Immersive Background Decorations */}
            <View style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(216, 243, 220, 0.1)' }} />
            <View style={{ position: 'absolute', bottom: 100, left: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(216, 243, 220, 0.05)' }} />

            <View style={{ width: "100%", alignItems: 'center', marginTop: 40 }}>
                <Image source={images["logo"]} style={{ width: 180, height: 60 }} resizeMode="contain" />
            </View>

            <View style={{ width: "90%", alignItems: "center" }}>
                <Text style={{ fontSize: 28, fontWeight: '900', color: 'white', marginBottom: 8 }}>Who are you?</Text>
                <Text style={{ fontSize: 16, color: '#D8F3DC', marginBottom: 40, opacity: 0.8 }}>Select your role to continue</Text>
                
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <TouchableHighlight 
                        underlayColor="transparent"
                        onPress={() => setOption("farmer")}
                        style={{ flex: 1, marginRight: 10 }}
                    >
                        <View style={{ 
                            ...styles.roleCard, 
                            backgroundColor: option == "farmer" ? "#D8F3DC" : "rgba(255, 255, 255, 0.1)",
                            borderColor: option == "farmer" ? "#1B4332" : "rgba(255, 255, 255, 0.2)",
                            borderWidth: 2
                        }}>
                            <View style={{ backgroundColor: option == "farmer" ? 'white' : 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 60, marginBottom: 15 }}>
                                <Image source={images['farmer']} style={{ height: 80, width: 42 }} resizeMode="contain" />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: option == "farmer" ? "#1B4332" : "white" }}>Farmer</Text>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight 
                        underlayColor="transparent"
                        onPress={() => setOption("dealer")}
                        style={{ flex: 1, marginLeft: 10 }}
                    >
                        <View style={{ 
                            ...styles.roleCard, 
                            backgroundColor: option == "dealer" ? "#EBF8FF" : "rgba(255, 255, 255, 0.1)",
                            borderColor: option == "dealer" ? "#2B6CB0" : "rgba(255, 255, 255, 0.2)",
                            borderWidth: 2
                        }}>
                            <View style={{ backgroundColor: option == "dealer" ? 'white' : 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 60, marginBottom: 15 }}>
                                <Image source={images['market']} style={{ width: 80, height: 70 }} resizeMode="contain" />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: option == "dealer" ? "#2B6CB0" : "white" }}>Dealer</Text>
                        </View>
                    </TouchableHighlight>
                </View>
            </View >

            <View style={{ width: '90%', marginBottom: 40 }}>
                <Button 
                    mode='contained' 
                    disabled={!option}
                    style={{ 
                        borderRadius: 15, 
                        backgroundColor: option ? '#FF9F1C' : 'rgba(255, 255, 255, 0.2)',
                        paddingVertical: 8
                    }} 
                    onPress={() => {
                        const user = {
                            ...route.params.user,
                            role: option
                        }
                        navigation.navigate('workinfo', { user: user })
                    }}
                >
                    <Text style={{ fontWeight: 'bold', color: option ? 'white' : '#AAA', fontSize: 18 }}>CONTINUE</Text>
                </Button>
            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B4332',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    roleCard: {
        alignItems: "center", 
        justifyContent: 'center', 
        height: 200, 
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    }
});
