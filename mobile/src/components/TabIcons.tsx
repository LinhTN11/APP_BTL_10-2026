import React from 'react';
import { View, StyleSheet } from 'react-native';

interface TabIconProps {
  color: string;
  size?: number;
  focused?: boolean;
}

/**
 * Clean modern vector icons built using native View components.
 * 100% sharp on all screen densities, zero missing font glyphs, zero broken boxes.
 */

export const DiscoverIcon: React.FC<TabIconProps> = ({ color, focused }) => {
  return (
    <View style={styles.container}>
      {/* Back card */}
      <View
        style={[
          styles.card,
          {
            borderColor: color,
            opacity: 0.6,
            transform: [{ rotate: '-12deg' }],
            left: 2,
            top: 2,
          },
        ]}
      />
      {/* Front card */}
      <View
        style={[
          styles.card,
          {
            borderColor: color,
            backgroundColor: focused ? color : '#FFFFFF',
            transform: [{ rotate: '8deg' }],
            left: 5,
            top: 1,
          },
        ]}
      />
    </View>
  );
};

export const MatchesIcon: React.FC<TabIconProps> = ({ color, focused }) => {
  return (
    <View style={styles.container}>
      {/* Chat bubble body */}
      <View
        style={[
          styles.bubble,
          {
            borderColor: color,
            backgroundColor: focused ? color : 'transparent',
          },
        ]}
      >
        {/* 3 chat dots */}
        <View style={styles.dotsRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: focused ? '#FFFFFF' : color },
            ]}
          />
          <View
            style={[
              styles.dot,
              { backgroundColor: focused ? '#FFFFFF' : color },
            ]}
          />
          <View
            style={[
              styles.dot,
              { backgroundColor: focused ? '#FFFFFF' : color },
            ]}
          />
        </View>
      </View>
      {/* Chat bubble tail */}
      <View
        style={[
          styles.bubbleTail,
          {
            borderTopColor: color,
          },
        ]}
      />
    </View>
  );
};

export const ProfileIcon: React.FC<TabIconProps> = ({ color, focused }) => {
  return (
    <View style={styles.container}>
      {/* Head */}
      <View
        style={[
          styles.userHead,
          {
            borderColor: color,
            backgroundColor: focused ? color : 'transparent',
          },
        ]}
      />
      {/* Shoulders */}
      <View
        style={[
          styles.userBody,
          {
            borderColor: color,
            backgroundColor: focused ? color : 'transparent',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: 15,
    height: 19,
    borderRadius: 3.5,
    borderWidth: 2,
  },
  bubble: {
    width: 22,
    height: 17,
    borderRadius: 6.5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2.5,
  },
  dot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: 2,
    left: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  userHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginBottom: 2,
  },
  userBody: {
    width: 20,
    height: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 2,
    borderBottomWidth: 0,
  },
});
