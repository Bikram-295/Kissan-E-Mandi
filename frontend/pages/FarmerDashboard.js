import React, { useEffect, useState } from 'react';
import images from '../images';
import globalStyles from '../globals';
import imageStyles from '../imagestyles';
import { ScrollView, View, StyleSheet, Image } from 'react-native';
import {
  FAB,
  Modal,
  Portal,
  Text,
  SegmentedButtons,
  TextInput,
  Button,
  Card,
  Menu,
  Chip,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, TransactionCard, MSPValuationModal, LifecycleStepper } from '../components';
import FarmerPendingCard from '../components/FarmerPendingCard';
import { checkLoggedIn } from '../utils';
import { useCreateListing, useListingsAll } from '../hooks/listing';
import { useTransactions, useUpdateTransaction } from '../hooks/transaction';
import { useCrops } from '../hooks/crops';
import { useTransactionSocket } from '../hooks/useTransactionSocket';
import { setTransactions, selectAllTransactions } from '../store/slices/transactionSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FarmerDashboard = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const containerStyle = { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12 };
  const [currName, setCurrName] = useState("");
  const [selectedList, setSelectedList] = useState("Dashboard");
  const [currID, setCurrID] = useState("");
  const [mspModalVisible, setMspModalVisible] = useState(false);

  const { crops, error, isLoading } = useCrops();
  const { transactions: rawTransactions, error: transError, isLoading: transLoading } = useTransactions();
  const { listingCreator, listingCreating } = useCreateListing();
  const { transactionUpdating, transactionUpdater } = useUpdateTransaction();
  const { listings } = useListingsAll();

  // Connect WebSocket for real-time lifecycle updates
  const { isConnected: wsConnected } = useTransactionSocket(currID);

  useEffect(() => {
    (async () => {
      const { username, id } = await checkLoggedIn(navigation);
      setCurrName(username);
      setCurrID(id);
    })();
  }, []);

  // Sync SWR transactions to Redux store
  useEffect(() => {
    if (rawTransactions && rawTransactions.length > 0) {
      dispatch(setTransactions(rawTransactions));
    }
  }, [rawTransactions, dispatch]);

  const reduxTransactions = useSelector(selectAllTransactions);
  const activeTransactions = reduxTransactions.length > 0 ? reduxTransactions : rawTransactions;

  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState("");
  const [quantity, setQuantity] = useState("");
  const [recipient, setRecipient] = useState("");

  const handlePending = async (id, dealer, farmer, crop_register, price, status, created_at) => {
    try {
      const response = await transactionUpdater({
        id: id,
        dealer: dealer.id,
        farmer: farmer.id,
        crop_register: crop_register.id,
        price: price,
        status: status,
        created_at: created_at,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleList = async () => {
    if (crop != "" && quantity != "" && recipient != "") {
      try {
        let match = false;
        crops &&
          crops.forEach((cropobj) => {
            if (cropobj.name.toLowerCase() === crop.toLowerCase()) {
              match = true;
            }
          });

        if (!match) {
          alert("Invalid crop name. Please enter a valid crop from the system.");
          return;
        }

        const currFarmer = await AsyncStorage.getItem("id");
        const currFarmerName = await AsyncStorage.getItem("username");
        const currCity = await AsyncStorage.getItem("city");

        const response = await listingCreator({
          farmer: currFarmer,
          quantity: parseInt(quantity),
          name: crop,
          dealer_type: recipient,
          farmer_name: currFarmerName,
          farmer_city: currCity,
          grade: "B",
          moisture_pct: 12.0,
        });

        setOpen(false);
        setCrop("");
        setQuantity("");
        setRecipient("");
      } catch (error) {
        console.error("Listing creation failed:", error);
        alert("Failed to list crop. Error: " + (error.response ? JSON.stringify(error.response.data) : error.message));
      }
    } else {
      alert("Please fill in all fields (Crop, Quantity, and Type)");
    }
  };

  // Filter listings for the current farmer
  const farmerListings = listings && listings.filter((listing) => listing.farmer === currID);

  // Pending deals (Stage 1: Pending / waiting_for_farmer)
  const farmerPendingDeals =
    currID != "" &&
    activeTransactions &&
    activeTransactions.filter((trans) => {
      return (
        trans.farmer.id === currID &&
        (trans.status === "waiting_for_farmer" || trans.status === "pending")
      );
    });

  // Active deals across the 6-stage lifecycle
  const farmerDoneDeals =
    currID != "" &&
    activeTransactions &&
    activeTransactions.filter((trans) => {
      return (
        trans.farmer.id === currID &&
        (trans.status === "deal_done" ||
          trans.status === "dispatched" ||
          trans.status === "delivered" ||
          trans.status === "inspected" ||
          trans.status === "payment_done")
      );
    });

  const displayListings =
    farmerListings &&
    farmerListings.map((listing) => {
      let cropMSP = 0;
      crops &&
        crops.forEach((cropObj) => {
          if (cropObj.name.toLowerCase() === listing.name.toLowerCase()) {
            cropMSP = cropObj.msp;
          }
        });

      const totalMSP = (cropMSP || 0) * (listing.quantity || 0);

      return (
        <Card key={listing.id} style={globalStyles.card}>
          <Card.Title
            title={listing.name}
            subtitle={`MSP: ₹${cropMSP} / kg`}
            titleStyle={{ color: '#1B4332', fontWeight: 'bold' }}
            right={() => (
              <Text variant="titleMedium" style={{ color: '#1B4332', marginRight: 16 }}>
                ₹{isNaN(totalMSP) ? 0 : totalMSP}
              </Text>
            )}
          />
          <Card.Content>
            <Text variant="bodyMedium" style={{ color: '#40916C' }}>
              Quantity: {listing.quantity} kg
            </Text>
          </Card.Content>
        </Card>
      );
    });

  const displayDoneDeals =
    farmerDoneDeals &&
    farmerDoneDeals.map((deal) => {
      return <TransactionCard key={deal.id} deal={deal} />;
    });

  const displayPending =
    farmerPendingDeals &&
    farmerPendingDeals.map((deal) => {
      return (
        <FarmerPendingCard
          key={deal.id}
          deal={deal}
          handlePending={handlePending}
        />
      );
    });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9F8' }}>
      <Navbar navigator={navigation} setSelected={setSelectedList} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <View style={globalStyles.heroSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={globalStyles.heroTitle}>Hello, {currName.split(' ')[0]}</Text>
              <Text style={globalStyles.heroSubtitle}>Your agricultural marketplace at a glance.</Text>
            </View>
            <Chip
              style={{ backgroundColor: wsConnected ? '#D8F3DC' : '#FFE8D6' }}
              textStyle={{ color: wsConnected ? '#1B4332' : '#D4A373', fontSize: 11, fontWeight: 'bold' }}
            >
              {wsConnected ? '● Live Sync' : '○ Connecting'}
            </Chip>
          </View>

          {/* Quick Stats Overview */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 24, marginHorizontal: -24, paddingHorizontal: 24 }}
          >
            <View style={{ ...globalStyles.statCard, ...globalStyles.statCardTeal }}>
              <Text style={globalStyles.statLabel}>My Crops</Text>
              <Text style={globalStyles.statValue}>{farmerListings ? farmerListings.length : 0}</Text>
            </View>
            <View style={{ ...globalStyles.statCard, ...globalStyles.statCardBlue }}>
              <Text style={globalStyles.statLabel}>Active Deals</Text>
              <Text style={globalStyles.statValue}>{farmerDoneDeals ? farmerDoneDeals.length : 0}</Text>
            </View>
            <View style={{ ...globalStyles.statCard, ...globalStyles.statCardAmber }}>
              <Text style={globalStyles.statLabel}>Pending Offers</Text>
              <Text style={globalStyles.statValue}>{farmerPendingDeals ? farmerPendingDeals.length : 0}</Text>
            </View>
          </ScrollView>
        </View>

        {/* Automated MSP Valuation Engine Banner */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Card style={{ backgroundColor: '#E8F5E9', borderColor: '#A3D9A5', borderWidth: 1 }}>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontWeight: 'bold', color: '#1B4332', fontSize: 15 }}>
                  🌾 Automated MSP Valuation Engine
                </Text>
                <Text style={{ color: '#40916C', fontSize: 12, marginTop: 2 }}>
                  Check statutory fair pricing, moisture penalties & quality grades.
                </Text>
              </View>
              <Button
                mode="contained"
                compact
                buttonColor="#1B4332"
                onPress={() => setMspModalVisible(true)}
              >
                Estimate Price
              </Button>
            </Card.Content>
          </Card>
        </View>

        <View style={{ padding: 20 }}>
          <View style={{ display: selectedList === 'Your crops' || selectedList === 'Dashboard' ? 'flex' : 'none' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text variant="headlineSmall" style={styles.sectionTitle}>Your Listings</Text>
              <Button textColor="#1B4332" onPress={() => setSelectedList('Your crops')}>View All</Button>
            </View>
            <View style={{ width: '100%' }}>{displayListings}</View>
          </View>

          <View style={{ display: selectedList === 'Your deals' || selectedList === 'Dashboard' ? 'flex' : 'none', marginTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text variant="headlineSmall" style={styles.sectionTitle}>6-Stage Active Deals</Text>
              <Button textColor="#1B4332" onPress={() => setSelectedList('Your deals')}>View All</Button>
            </View>
            <View style={{ width: '100%' }}>{displayDoneDeals}</View>
          </View>

          <View style={{ display: selectedList === 'Offers' || selectedList === 'Dashboard' ? 'flex' : 'none', marginTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text variant="headlineSmall" style={styles.sectionTitle}>Incoming Offers</Text>
              <Button textColor="#1B4332" onPress={() => setSelectedList('Offers')}>View All</Button>
            </View>
            <View style={{ width: '100%' }}>{displayPending}</View>
          </View>
        </View>
      </ScrollView>

      <FAB icon="plus" style={styles.fab} color="white" onPress={() => setOpen(true)} />

      {/* MSP Valuation Modal */}
      <MSPValuationModal
        visible={mspModalVisible}
        onDismiss={() => setMspModalVisible(false)}
      />

      {/* Listing Creation Modal */}
      <Portal>
        <Modal visible={open} onDismiss={() => setOpen(false)} contentContainerStyle={containerStyle}>
          <Text variant="headlineSmall" style={{ marginBottom: 16, color: '#1B4332', fontWeight: 'bold' }}>
            List Your Harvest
          </Text>
          <TextInput
            label="Crop Name"
            value={crop}
            onChangeText={setCrop}
            mode="outlined"
            style={{ marginBottom: 12, backgroundColor: 'white' }}
            outlineColor="#1B4332"
            activeOutlineColor="#2EB62C"
          />
          <TextInput
            label="Quantity (kg)"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            mode="outlined"
            style={{ marginBottom: 12, backgroundColor: 'white' }}
            outlineColor="#1B4332"
            activeOutlineColor="#2EB62C"
          />
          <Text variant="labelLarge" style={{ marginBottom: 8, color: '#1B4332' }}>
            Sell To:
          </Text>
          <SegmentedButtons
            value={recipient}
            onValueChange={setRecipient}
            buttons={[
              { value: 'p', label: 'Private' },
              { value: 'g', label: 'Govt' },
              { value: 'b', label: 'Both' },
            ]}
            style={{ marginBottom: 20 }}
          />
          <Button
            mode="contained"
            onPress={handleList}
            loading={listingCreating}
            buttonColor="#1B4332"
            style={{ paddingVertical: 4 }}
          >
            Publish Listing
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

export default FarmerDashboard;

const styles = StyleSheet.create({
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1B4332',
    fontSize: 20,
  },
  pfp: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1B4332',
  },
});