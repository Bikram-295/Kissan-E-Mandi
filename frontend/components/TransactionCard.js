import React, { useState, useEffect } from "react";
import images from "../images";
import {
  Card,
  Chip,
  Button as PaperButton,
  Portal,
  Modal,
  Divider,
} from "react-native-paper";
import { View, StyleSheet, Image, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import globalStyles from "../globals";
import { useUpdateTransaction } from "../hooks/transaction";
import LifecycleStepper from "./LifecycleStepper";
import { updateTransactionStatus } from "../store/slices/transactionSlice";

const STAGE_LABELS = {
  pending: "Pending",
  waiting_for_farmer: "Pending Offer",
  deal_done: "Deal Done",
  dispatched: "Dispatched",
  delivered: "Delivered",
  inspected: "Inspected",
  payment_done: "Payment Done",
  rejected: "Rejected",
};

const STAGE_COLORS = {
  pending: "#FFB703",
  waiting_for_farmer: "#FFB703",
  deal_done: "#219ebc",
  dispatched: "#8ecae6",
  delivered: "#52B788",
  inspected: "#40916C",
  payment_done: "#2EB62C",
  rejected: "#BC4749",
};

const TransactionCard = ({ deal, statusColor, statusDisplay }) => {
  const dispatch = useDispatch();
  const { transactionUpdater, transactionUpdating } = useUpdateTransaction();
  const { farmer, dealer, price, crop_register, status, created_at, id } = deal;

  const [open, setOpen] = useState(false);
  const containerStyle = { backgroundColor: "white", padding: 20, margin: 20, borderRadius: 12 };

  const [currId, setCurrId] = useState("");
  const [dealerType, setDealerType] = useState("");

  useEffect(() => {
    (async () => {
      const storedId = await AsyncStorage.getItem("id");
      const storedDealerType = await AsyncStorage.getItem("dealer_type");
      setCurrId(storedId);
      setDealerType(storedDealerType);
    })();
  }, []);

  // 6-Stage sequential state machine progression
  let nextStage = null;
  let nextActionLabel = null;

  if (deal.status === "pending" || deal.status === "waiting_for_farmer") {
    nextStage = "deal_done";
    nextActionLabel = "Accept Deal (Lock Agreement)";
  } else if (deal.status === "deal_done") {
    nextStage = "dispatched";
    nextActionLabel = "Mark Dispatched (In Transit)";
  } else if (deal.status === "dispatched") {
    nextStage = "delivered";
    nextActionLabel = "Confirm Delivery at Mandi";
  } else if (deal.status === "delivered") {
    nextStage = "inspected";
    nextActionLabel = "Verify & Mark Inspected";
  } else if (deal.status === "inspected") {
    nextStage = "payment_done";
    nextActionLabel = "Release Settlement (Payment Done)";
  }

  const handleTransition = async (targetStatus) => {
    try {
      const payload = {
        id: id,
        dealer: dealer.id,
        farmer: farmer.id,
        crop_register: crop_register.id,
        price: price,
        status: targetStatus,
        created_at: created_at,
      };
      const response = await transactionUpdater(payload);
      dispatch(updateTransactionStatus({ id, status: targetStatus }));
      setOpen(false);
    } catch (error) {
      console.error("Transition failed:", error);
    }
  };

  const activeColor = STAGE_COLORS[deal.status] || statusColor || "#1B4332";
  const activeLabel = STAGE_LABELS[deal.status] || statusDisplay || deal.status;

  return (
    <>
      <Portal>
        <Modal
          visible={open}
          contentContainerStyle={containerStyle}
          onDismiss={() => setOpen(false)}
        >
          <Text style={styles.modalTitle}>
            Transaction #{deal.id} Lifecycle Management
          </Text>
          <Text style={styles.modalSubtitle}>
            Current Stage: {activeLabel}
          </Text>

          <LifecycleStepper status={deal.status} stageNumber={deal.stage_number} />

          {nextStage && (
            <PaperButton
              style={styles.actionBtn}
              mode="contained"
              loading={transactionUpdating}
              buttonColor="#1B4332"
              onPress={() => handleTransition(nextStage)}
            >
              Advance Stage: {nextActionLabel}
            </PaperButton>
          )}

          {(deal.status === "pending" || deal.status === "waiting_for_farmer") && (
            <PaperButton
              style={[styles.actionBtn, { marginTop: 8 }]}
              mode="outlined"
              textColor="#BC4749"
              onPress={() => handleTransition("rejected")}
            >
              Reject Offer
            </PaperButton>
          )}

          <PaperButton
            style={{ marginTop: 12 }}
            mode="text"
            onPress={() => setOpen(false)}
          >
            Close
          </PaperButton>
        </Modal>
      </Portal>

      <Card key={deal.id} style={{ ...globalStyles.card, paddingHorizontal: 0 }}>
        <Card.Content
          style={{
            marginBottom: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#D8F3DC",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image source={images["profile"]} style={{ width: 24, height: 24 }} />
            </View>
            <View>
              <Text style={{ fontWeight: "bold" }}>{deal.dealer.username}</Text>
              <Text style={{ color: "#666", fontSize: 11 }}>
                Farmer: {deal.farmer.username}
              </Text>
            </View>
          </View>
          <Text style={{ color: "#666", fontSize: 13 }}>
            {deal.crop_register.farmer_city} Mandi
          </Text>
        </Card.Content>

        {/* 6-Stage Transaction Lifecycle Visual Stepper */}
        <Card.Content>
          <LifecycleStepper status={deal.status} stageNumber={deal.stage_number} />
        </Card.Content>

        <Divider style={{ marginBottom: 12 }} />

        <Card.Content
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
              {deal.crop_register.quantity} kg {deal.crop_register.name}
            </Text>
            <Text style={{ color: "#1B4332" }}>Offer: ₹{deal.price} / kg</Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1B4332",
                marginTop: 8,
              }}
            >
              Total: ₹{deal.price * deal.crop_register.quantity}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <Chip
              style={{ backgroundColor: activeColor }}
              textStyle={{ color: "white", fontWeight: "bold" }}
              onPress={() => setOpen(true)}
            >
              {activeLabel}
            </Chip>
            {nextStage && (
              <PaperButton
                mode="contained-tonal"
                compact
                buttonColor="#D8F3DC"
                textColor="#1B4332"
                onPress={() => setOpen(true)}
              >
                Next Step
              </PaperButton>
            )}
          </View>
        </Card.Content>
      </Card>
    </>
  );
};

export default TransactionCard;

const styles = StyleSheet.create({
  pfp: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  actionBtn: {
    marginTop: 12,
    borderRadius: 8,
  },
});
