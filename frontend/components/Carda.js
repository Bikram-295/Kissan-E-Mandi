import React, { useState,useEffect } from "react";
import images from "../images";
import { Appbar, List, Card } from "react-native-paper";
import { View, StyleSheet, Image, Text } from "react-native";
import { Button } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OfferPrice } from "./index.js";
import globalStyles from "../globals";
import {
  useCreateTransaction,
  useTransactionsFarmer,
  useTransactionsAll,
} from "../hooks/transaction";

// const EditPrice=({transaction})=>{

//     //wamt price from it
//     //need msp as input from card , trnsation objevt

//     const price,setPrice=useState("");
//     const msp=transaction['price'];
//     const [error, setError] = useState(null);
//     const onSubmit=()=>{
//         if(price <transaction['price']){
//             setError("Price must be greater than msp");
//         }

//          const updatedTransaction = {
//             ...transaction,
//             price: price,
//             // Any other properties you want to update
//         };

//         const response = await useTransactionCreator(transaction);
//         console.log(response);
//     }

//     return (
//         <View style={{display:'flex'}}>
//         <View style={globalStyles.formField}>
//                     {error && <Text>Error: {error}</Text>}
//                     <Text style={globalStyles.formLabels}>Price  Msp-:{msp}</Text>
//                     <TextInput style={globalStyles.textInput} mode='outlined' value={price} onChangeText={(txt) => setPrice(txt)} />
//         </View>
//         <View style={{alignSelf:'flex-end'}}>
//        <Button
//           title="Accept"
//           buttonStyle={{ backgroundColor: "rgba(127, 220, 103, 1)" }}
//           containerStyle={{
//             height: 40,
//             width: 80,
//             marginHorizontal: 30,
//             marginVertical: 10,
//           }}
//           titleStyle={{
//             color: "white",
//           }}
//           onClick={onSubmit}
//         />
//         </View>
//         </View>
//     );
// }

const Carda = ({ listing, msp }) => {
  console.log("lsitindscfwawed", listing);
  const {farmer,id} = listing;
  const {transactionCreator, transactionCreating} = useCreateTransaction();

  const openSetPrice = () => {};
  const [openEditPrice, setOpenEditPrice] = useState(false);
  const [transaction, setTransaction] = useState("");
  const [currId, setCurrId] = useState("");
  const [display, setDisplay] = useState(true)
  const [dealerType, setDealerType] = useState("")




  const handleAccept = async (farmer,id, msp) => {
    // const currDealer= await AsyncStorage.getItem("Id");
    const dealerType = await AsyncStorage.getItem("dealer_type");
    console.log("fwrefwefew", listing);
    console.log(farmer,id,msp,currId);
    const transaction = {
      farmer: farmer,
      dealer: parseInt(currId),
      status: "waiting_for_farmer",
      price: msp,
      crop_register: id,
    };

    if (dealerType == "private") {
      console.log("jaea");
      setTransaction(transaction);
      setOpenEditPrice(true);
      return;
    }
    console.log("jaa")
    const response = await transactionCreator(transaction);
    console.log(response);
    setDisplay(false)
  };

  useEffect(() => {
    (async () => {
      const currId = await AsyncStorage.getItem("id");
      const dealerType= await AsyncStorage.getItem("dealer_type");
      setCurrId(currId);
      setDealerType(dealerType);
    })();
  }, []);

  return (
    <Card
      key={listing.id} 
      style={{ ...globalStyles.card, display : display ? "flex" : "none"}}
    >
      <Card.Content style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#D8F3DC', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={images["photo"]} style={{ width: 24, height: 24 }} />
          </View>
          <Text style={{ fontWeight: 'bold', color: '#1B4332' }}>{listing.farmer_name}</Text>
        </View>
        <Text style={{ color: '#666', fontSize: 13 }}>{listing.farmer_city}</Text>
      </Card.Content>
      
      <Divider style={{ marginBottom: 12 }} />

      <Card.Content style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
          {listing.quantity} kg {listing.name}
        </Text>
        <Text style={{ color: '#666', fontSize: 13 }}>MSP: ₹{msp} / kg</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: "#1B4332", marginTop: 8 }}>
          By MSP: ₹{msp * listing.quantity}
        </Text>
      </Card.Content>

      <Card.Actions style={{ justifyContent: 'space-between', paddingHorizontal: 0 }}>
        <Button
          title="Reject"
          type="outline"
          buttonStyle={{ borderColor: '#BC4749', borderWidth: 1 }}
          titleStyle={{ color: '#BC4749' }}
          containerStyle={{ flex: 1, marginRight: 8 }}
          onPress={() => setDisplay(false)}
        />

        <Button
          title="Accept"
          buttonStyle={{ backgroundColor: "#1B4332" }}
          containerStyle={{ flex: 2 }}
          onPress={() => handleAccept(farmer, id, msp )}
        />
      </Card.Actions>
      <OfferPrice transaction={transaction} openEditPrice={openEditPrice} setOpenEditPrice={setOpenEditPrice} />
    </Card>
  );
};

export default Carda;
const stoStyles = StyleSheet.create({
  photo: {
    width: 30,
    height: 30,
  },
  bar: {
    width: 350,
    height: 10,
    display: "flex",
    alignItems: "center",
    borderRadius: 20,
  },
});
