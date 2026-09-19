import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar, Chip } from 'react-native-paper';

const STAGES = [
  { key: 'pending', label: '1. Pending', short: 'Pending' },
  { key: 'deal_done', label: '2. Deal Done', short: 'Deal Done' },
  { key: 'dispatched', label: '3. Dispatched', short: 'Dispatched' },
  { key: 'delivered', label: '4. Delivered', short: 'Delivered' },
  { key: 'inspected', label: '5. Inspected', short: 'Inspected' },
  { key: 'payment_done', label: '6. Payment Done', short: 'Payment' },
];

export const LifecycleStepper = ({ status, stageNumber }) => {
  // Normalize legacy 'waiting_for_farmer' to 'pending'
  const currentKey = status === 'waiting_for_farmer' ? 'pending' : status;

  let activeIndex = STAGES.findIndex((s) => s.key === currentKey);
  if (activeIndex === -1 && stageNumber) {
    activeIndex = stageNumber - 1;
  }
  if (activeIndex === -1) {
    activeIndex = 0;
  }

  const isRejected = currentKey === 'rejected';
  const progressRatio = isRejected ? 0 : (activeIndex + 1) / STAGES.length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="labelSmall" style={styles.title}>
          6-STAGE TRANSACTION LIFECYCLE
        </Text>
        <Text variant="labelSmall" style={styles.progressText}>
          {isRejected ? 'REJECTED' : `Stage ${activeIndex + 1} of 6 (${Math.round(progressRatio * 100)}%)`}
        </Text>
      </View>

      <ProgressBar
        progress={progressRatio}
        color={isRejected ? '#BC4749' : '#2EB62C'}
        style={styles.progressBar}
      />

      <View style={styles.stagesRow}>
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex && !isRejected;

          let chipBg = '#E0E0E0';
          let textColor = '#666';

          if (isCompleted) {
            chipBg = '#D8F3DC';
            textColor = '#1B4332';
          } else if (isCurrent) {
            chipBg = '#1B4332';
            textColor = '#FFFFFF';
          }

          return (
            <View key={stage.key} style={styles.stageItem}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: chipBg },
                ]}
              >
                <Text style={[styles.badgeText, { color: textColor }]}>
                  {idx + 1}
                </Text>
              </View>
              <Text
                variant="bodySmall"
                style={[
                  styles.stageLabel,
                  isCurrent ? styles.activeLabel : null,
                ]}
                numberOfLines={1}
              >
                {stage.short}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default LifecycleStepper;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 12,
    backgroundColor: '#F3F7F4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8F3DC',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontWeight: 'bold',
    color: '#1B4332',
    letterSpacing: 0.5,
  },
  progressText: {
    fontWeight: 'bold',
    color: '#2EB62C',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  stagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageItem: {
    alignItems: 'center',
    flex: 1,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  stageLabel: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
  },
  activeLabel: {
    fontWeight: 'bold',
    color: '#1B4332',
  },
});
