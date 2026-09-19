import React, { useEffect, useState } from "react";
import images from "../images";
import globalStyles from "../globals";
import { useCrops } from "../hooks/crops";
import imageStyles from "../imagestyles";
import { View, ScrollView, StyleSheet, Image } from "react-native";
import { Text, Chip, Card, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { checkLoggedIn } from "../utils";
import { Storage, Navbar, Carda, TransactionCard, MSPValuationModal } from "./../components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useListingsAll } from "../hooks/listing";
import { useTransactions } from "../hooks/transaction";
import { useTransactionSocket } from "../hooks/useTransactionSocket";
import { setTransactions, selectAllTransactions } from "../store/slices/transactionSlice";

const DealerDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const [currName, setCurrName] = useState("");
  const [currID, setCurrID] = useState("");
  const [currCity, setCurrCity] = useState("");
  const [mspModalVisible, setMspModalVisible] = useState(false);

  const { crops, error, isLoading } = useCrops();
  const {
    transactions: rawTransactions,
    error: transError,
    isLoading: transLoading,
  } = useTransactions();
  const { listings } = useListingsAll();

  // Connect WebSocket for real-time lifecycle sync
  const { isConnected: wsConnected } = useTransactionSocket(currID);

  useEffect(() => {
    (async () => {
      const { username, id } = await checkLoggedIn(navigation);
      setCurrName(username);
      setCurrID(id);
      const city = await AsyncStorage.getItem("city");
      setCurrCity(city || "");
    })();
  }, []);

  // Synchronize transactions with Redux store
  useEffect(() => {
    if (rawTransactions && rawTransactions.length > 0) {
      dispatch(setTransactions(rawTransactions));
    }
  }, [rawTransactions, dispatch]);

  const reduxTransactions = useSelector(selectAllTransactions);
  const activeTransactions = reduxTransactions.length > 0 ? reduxTransactions : rawTransactions;

  // 6-stage active deals for the current dealer
  const dealerDeals =
    currID != "" &&
    activeTransactions &&
    activeTransactions.filter((trans) => {
      return (
        trans.dealer.id === currID &&
        (trans.status === "deal_done" ||
          trans.status === "dispatched" ||
          trans.status === "delivered" ||
          trans.status === "inspected" ||
          trans.status === "payment_done")
      );
    });

  const dealerListings =
    listings &&
    (currCity
      ? listings.filter((listing) => listing.farmer_city?.toLowerCase() === currCity.toLowerCase())
      : listings);

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9F8" }}>
      <Navbar navigator={navigation} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Section */}
        <View style={globalStyles.heroSection}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={globalStyles.heroTitle}>Hello, {currName.split(" ")[0]}</Text>
              <Text style={globalStyles.heroSubtitle}>Explore the latest listings from local farmers.</Text>
            </View>
            <Chip
              style={{ backgroundColor: wsConnected ? "#D8F3DC" : "#FFE8D6" }}
              textStyle={{ color: wsConnected ? "#1B4332" : "#D4A373", fontSize: 11, fontWeight: "bold" }}
            >
              {wsConnected ? "● Live Sync" : "○ Connecting"}
            </Chip>
          </View>

          {/* Quick Stats Overview */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 24, marginHorizontal: -24, paddingHorizontal: 24 }}
          >
            <View style={{ ...globalStyles.statCard, ...globalStyles.statCardTeal }}>
              <Text style={globalStyles.statLabel}>Available Crops</Text>
              <Text style={globalStyles.statValue}>{dealerListings ? dealerListings.length : 0}</Text>
            </View>
            <View style={{ ...globalStyles.statCard, ...globalStyles.statCardBlue }}>
              <Text style={globalStyles.statLabel}>Active 6-Stage Deals</Text>
              <Text style={globalStyles.statValue}>{dealerDeals ? dealerDeals.length : 0}</Text>
            </View>
            <View style={{ ...globalStyles.statCard, ...globalStyles.statCardAmber }}>
              <Text style={globalStyles.statLabel}>My Mandi City</Text>
              <Text style={globalStyles.statValue}>{currCity || "All"}</Text>
            </View>
          </ScrollView>
        </View>

        {/* Automated MSP Valuation Engine Banner for Dealers */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Card style={{ backgroundColor: "#E8F5E9", borderColor: "#A3D9A5", borderWidth: 1 }}>
            <Card.Content style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontWeight: "bold", color: "#1B4332", fontSize: 15 }}>
                  🌾 MSP Fair Valuation Engine
                </Text>
                <Text style={{ color: "#40916C", fontSize: 12, marginTop: 2 }}>
                  Check government benchmark MSP floor and quality grade adjustments.
                </Text>
              </View>
              <Button
                mode="contained"
                compact
                buttonColor="#1B4332"
                onPress={() => setMspModalVisible(true)}
              >
                Evaluate Offer
              </Button>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.content}>
          {/* Active Deals Section */}
          {dealerDeals && dealerDeals.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text variant="headlineSmall" style={styles.sectionTitle}>
                Active 6-Stage Transactions
              </Text>
              <View style={{ width: "100%", marginTop: 8 }}>
                {dealerDeals.map((deal) => (
                  <TransactionCard key={deal.id} deal={deal} />
                ))}
              </View>
            </View>
          )}

          {/* Farmer Listings Section */}
          <View style={{ marginTop: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text variant="headlineSmall" style={styles.sectionTitle}>
                Farmer Harvest Listings
              </Text>
              <Text style={{ color: "#1B4332", fontWeight: "bold" }}>
                In {currCity || "All Mandis"}
              </Text>
            </View>
            <View style={{ width: "100%" }}>
              {dealerListings &&
                dealerListings.map((listing) => {
                  let msp = 0;
                  const matchedCrop =
                    crops && crops.find((crop) => crop.name.toLowerCase() === listing.name.toLowerCase());
                  if (matchedCrop) {
                    msp = matchedCrop.msp;
                  }
                  return <Carda key={listing.id} listing={listing} msp={msp} />;
                })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MSP Valuation Modal */}
      <MSPValuationModal
        visible={mspModalVisible}
        onDismiss={() => setMspModalVisible(false)}
      />
    </View>
  );
};

export default DealerDashboard;

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#1B4332",
    fontSize: 20,
  },
});
