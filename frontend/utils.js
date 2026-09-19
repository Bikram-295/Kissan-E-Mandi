import AsyncStorage from '@react-native-async-storage/async-storage';



export const checkLoggedIn = async (navigator) => {
    const id = await AsyncStorage.getItem("id")
    const username = await AsyncStorage.getItem("username")
    const access = await AsyncStorage.getItem("access")
    if(!id || !username || !access)
    {
        console.log("nope")
        navigator.navigate("login")
    }
    return {username : username, id : id}
}