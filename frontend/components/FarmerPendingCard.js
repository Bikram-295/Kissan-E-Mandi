import { View, Image } from "react-native"
import images from "../images"
import { Card, Text, Button } from 'react-native-paper'


export default function FarmerPendingCard({ deal, handlePending }) {
    const {id, dealer, farmer, crop_register, price, status, deal_Date, created_at, delivery_date } = deal;
    return (
        <Card
            key={id}
            style={globalStyles.card}
        >
            <Card.Content style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFE8D6', alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images["photo"]} style={{ width: 24, height: 24 }} />
                    </View>
                    <Text style={{ fontWeight: 'bold' }}>{dealer.username}</Text>
                </View>
                <Text style={{ color: '#666', fontSize: 13 }}>{crop_register.farmer_city} Mandi</Text>
            </Card.Content>

            <Divider style={{ marginBottom: 12 }} />

            <Card.Content style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                    {crop_register.quantity} kg {crop_register.name}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: "#1B4332", marginTop: 4 }}>
                    You get : ₹{price * crop_register.quantity}
                </Text>
            </Card.Content>

            <Card.Actions style={{ justifyContent: 'space-between', paddingHorizontal: 0 }}>
                <Button
                    mode="outlined"
                    textColor="#BC4749"
                    style={{ flex: 1, marginRight: 8, borderColor: '#BC4749' }}
                    onPress={() => 
                        handlePending(id, dealer, farmer, crop_register, price, "rejected", created_at)
                    }
                >Reject</Button>

                <Button
                    mode="contained"
                    style={{ flex: 2, backgroundColor: "#1B4332" }}
                    onPress={() => handlePending(id, dealer, farmer, crop_register, price, "deal_done", created_at)
                }
                >Accept Offer</Button>
            </Card.Actions>
        </Card>
    )
}