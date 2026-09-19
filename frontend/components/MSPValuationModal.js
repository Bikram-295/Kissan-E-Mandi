import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import axios from 'axios';
import { mspValuationURL } from '../urls';

export const MSPValuationModal = ({ visible, onDismiss, initialCrop = '', initialQty = '100' }) => {
  const [cropName, setCropName] = useState(initialCrop || 'Wheat');
  const [quantity, setQuantity] = useState(initialQty || '100');
  const [grade, setGrade] = useState('B');
  const [moisture, setMoisture] = useState('12.0');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [valuationResult, setValuationResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleEvaluate = async () => {
    if (!cropName || !quantity) {
      setErrorMsg('Please provide crop name and quantity');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        crop_name: cropName.trim(),
        quantity: parseFloat(quantity) || 100,
        grade: grade,
        moisture_pct: parseFloat(moisture) || 12.0,
      };
      if (offeredPrice && !isNaN(offeredPrice)) {
        payload.offered_price = parseFloat(offeredPrice);
      }

      const response = await axios.post(mspValuationURL, payload);
      setValuationResult(response.data);
    } catch (err) {
      console.error('Valuation error:', err);
      setErrorMsg(
        err.response?.data?.error || err.message || 'Failed to calculate MSP valuation'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Automated MSP Valuation Engine
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            Statutory pricing estimates & fair deal evaluation
          </Text>

          {errorMsg && (
            <Text style={styles.errorText}>{errorMsg}</Text>
          )}

          <TextInput
            label="Crop Name (e.g. Wheat, Rice, Maize)"
            value={cropName}
            onChangeText={setCropName}
            mode="outlined"
            style={styles.input}
            outlineColor="#1B4332"
            activeOutlineColor="#2EB62C"
          />

          <TextInput
            label="Quantity (in kg)"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            outlineColor="#1B4332"
            activeOutlineColor="#2EB62C"
          />

          <Text variant="labelMedium" style={styles.sectionLabel}>
            Quality Grade:
          </Text>
          <SegmentedButtons
            value={grade}
            onValueChange={setGrade}
            buttons={[
              { value: 'A', label: 'Grade A (+5%)' },
              { value: 'B', label: 'FAQ (Std)' },
              { value: 'C', label: 'Grade C (-10%)' },
            ]}
            style={styles.segmented}
          />

          <TextInput
            label="Moisture % (Standard 12-14%)"
            value={moisture}
            onChangeText={setMoisture}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            outlineColor="#1B4332"
            activeOutlineColor="#2EB62C"
          />

          <TextInput
            label="Offered Price / kg (Optional: To verify fair deal)"
            value={offeredPrice}
            onChangeText={setOfferedPrice}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            outlineColor="#1B4332"
            activeOutlineColor="#2EB62C"
          />

          <Button
            mode="contained"
            onPress={handleEvaluate}
            loading={loading}
            style={styles.calculateBtn}
            buttonColor="#1B4332"
          >
            Calculate Fair Valuation
          </Button>

          {valuationResult && (
            <Card style={styles.resultCard}>
              <Card.Content>
                <View style={styles.resultHeader}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#1B4332' }}>
                    Valuation Report: {valuationResult.crop?.name}
                  </Text>
                  <Chip style={{ backgroundColor: '#D8F3DC' }} textStyle={{ color: '#1B4332', fontWeight: 'bold' }}>
                    ₹{valuationResult.valuation_breakdown?.recommended_price_per_kg}/kg
                  </Chip>
                </View>

                <Divider style={{ marginVertical: 8 }} />

                <View style={styles.dataRow}>
                  <Text style={styles.dataKey}>Statutory Base MSP:</Text>
                  <Text style={styles.dataVal}>₹{valuationResult.crop?.official_msp_per_kg}/kg</Text>
                </View>

                <View style={styles.dataRow}>
                  <Text style={styles.dataKey}>Grade Adjustment:</Text>
                  <Text style={styles.dataVal}>
                    {valuationResult.valuation_breakdown?.grade_adjustment_per_kg >= 0 ? '+' : ''}
                    ₹{valuationResult.valuation_breakdown?.grade_adjustment_per_kg}/kg
                  </Text>
                </View>

                <View style={styles.dataRow}>
                  <Text style={styles.dataKey}>Moisture Deduction:</Text>
                  <Text style={styles.dataVal}>
                    -₹{valuationResult.valuation_breakdown?.moisture_deduction_per_kg}/kg
                  </Text>
                </View>

                <View style={styles.dataRow}>
                  <Text style={styles.dataKey}>Total Fair Valuation:</Text>
                  <Text style={[styles.dataVal, { fontWeight: 'bold', color: '#1B4332', fontSize: 16 }]}>
                    ₹{valuationResult.valuation_breakdown?.total_estimated_valuation}
                  </Text>
                </View>

                <View style={styles.dataRow}>
                  <Text style={styles.dataKey}>Fair Price Band:</Text>
                  <Text style={styles.dataVal}>
                    ₹{valuationResult.valuation_breakdown?.fair_price_band?.floor_price_per_kg} - ₹{valuationResult.valuation_breakdown?.fair_price_band?.ceiling_price_per_kg} / kg
                  </Text>
                </View>

                {valuationResult.offer_analysis && (
                  <View style={styles.offerSection}>
                    <Divider style={{ marginVertical: 8 }} />
                    <View style={styles.resultHeader}>
                      <Text style={{ fontWeight: 'bold' }}>Offer Evaluation:</Text>
                      <Chip
                        style={{
                          backgroundColor:
                            valuationResult.offer_analysis.status === 'BELOW_MSP_FLOOR_ALERT'
                              ? '#FFD1D1'
                              : '#D8F3DC',
                        }}
                        textStyle={{
                          color:
                            valuationResult.offer_analysis.status === 'BELOW_MSP_FLOOR_ALERT'
                              ? '#BC4749'
                              : '#1B4332',
                          fontWeight: 'bold',
                        }}
                      >
                        {valuationResult.offer_analysis.status}
                      </Chip>
                    </View>
                    <Text variant="bodySmall" style={{ marginTop: 4, color: '#444' }}>
                      {valuationResult.offer_analysis.advice}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          <Button mode="text" onPress={onDismiss} style={{ marginTop: 8 }} textColor="#666">
            Close
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

export default MSPValuationModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1B4332',
  },
  headerSubtitle: {
    color: '#666',
    marginBottom: 12,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  sectionLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  segmented: {
    marginBottom: 12,
  },
  calculateBtn: {
    marginVertical: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  errorText: {
    color: '#BC4749',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  resultCard: {
    marginTop: 10,
    backgroundColor: '#F8FAF9',
    borderColor: '#D8F3DC',
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  dataKey: {
    color: '#555',
    fontSize: 13,
  },
  dataVal: {
    fontSize: 13,
    color: '#222',
  },
  offerSection: {
    marginTop: 6,
  },
});
