import React, { useState } from 'react'
import images from '../images'
import imageStyles from '../imagestyles'
import globalStyles from '../globals'
import { Image, View } from 'react-native'
import { Button, Text, TextInput } from 'react-native-paper'
import { useCreateUser } from '../hooks/users'


export default function WorkInfo({ navigation, route }) {
    const [type, setType] = useState("")
    const [passwd, setPasswd] = useState("")
    const [confirm, setConfirm] = useState("")
    const { userCreator, userCreating } = useCreateUser()
    const handleSubmit = async () => {
        // Validation checks
        if (passwd === "" || passwd !== confirm) {
            alert("Passwords do not match or are empty");
            return;
        }

        if (route.params.user.role === "dealer" && type === "") {
            alert("Please enter a dealer type");
            return;
        }

        try {
            const userObj = {
                username : route.params.user.first_name + "_" + route.params.user.last_name,
                password : passwd,
                city : route.params.user.city,
                state : route.params.user.state,
                id : route.params.user.id,
                role : route.params.user.role,
                dealer_type : (route.params.user.role === "farmer" ? "farmer" : type),
            }
            console.log("Submitting user configuration:", userObj);
            const res = await userCreator(userObj);
            console.log("User creation response:", res);
            navigation.navigate('login', {})
        }
        catch (error) {
            console.log("Error creating user:", error);
            let errMsg = "Failed to create user. Please try again.";
            if (error.response && error.response.data) {
                // Handle Django Rest Framework standard error format
                if (typeof error.response.data === 'object') {
                    errMsg = Object.entries(error.response.data)
                        .map(([key, val]) => `${key}: ${val}`)
                        .join("\n");
                } else {
                    errMsg = error.response.data;
                }
            }
            alert(errMsg);
        }
    }
    return (
        <View style={{ ...globalStyles.container, maxHeight: 937 }}>
            <Image source={images['logo']} style={imageStyles.logo} />
            <View style={{ alignItems: "center", width: "100%" }}>
                <Text variant='headlineMedium'>Password</Text>
                <View style={{ ...globalStyles.formField, display: (route.params.user.role === "farmer" ? "none" : "flex") }}>
                    <Text style={globalStyles.formLabels}>Dealer Type</Text>
                    <TextInput style={globalStyles.textInput} mode='outlined' value={type} onChangeText={(txt) => setType(txt)} />
                </View>
                <View style={globalStyles.formField}>
                    <Text style={globalStyles.formLabels}>Password</Text>
                    <TextInput style={globalStyles.textInput} mode='outlined' value={passwd} onChangeText={(txt) => setPasswd(txt)} />
                </View>
                <View style={globalStyles.formField}>
                    <Text style={globalStyles.formLabels}>Reenter Password</Text>
                    <TextInput style={globalStyles.textInput} mode='outlined' value={confirm} onChangeText={(txt) => setConfirm(txt)} />
                </View>
                <Button onPress={handleSubmit} style={{ width: "80%" }} mode='contained'>Done</Button>
                <View style={{ flexDirection: "row" }}>
                    <Text style={{ padding: 12, fontSize: 12 }}>Already have an account? </Text>
                    <Button style={{ height: 10, fontSize: 10 }} compact onPress={() => navigation.navigate('login')}>Login</Button>
                </View>
            </View>
            <Image source={images['barn']} style={bottomStyles.barn} />
            <Image source={images['mound']} style={bottomStyles.mound} />
            <Image source={images['tractor']} style={bottomStyles.tractor} />
        </View>
    )
}

const bottomStyles = {
    barn: {
        zIndex: 0,
        position: "absolute",
        width: 216,
        height: 181,
        top: 668,
        left: -11
    },
    mound: {
        height: 150,
        width: 1087,
        zIndex: -1,
        position: "absolute",
        top: 830,
        left: -379,
    },
    tractor: {
        height: 216,
        width: 274,
        zIndex: 1,
        position: "absolute",
        top: 681,
        left: 156
    }
}