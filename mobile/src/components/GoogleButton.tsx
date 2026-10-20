import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
  text?: string;
}

// Official 4-color Google "G" vector logo
const OfficialGoogleLogo = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    {/* Blue - Right bar and arc */}
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
    />
    {/* Green - Bottom arc */}
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.25 21.31 7.34 24 12 24z"
    />
    {/* Yellow - Left arc */}
    <Path
      fill="#FBBC05"
      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.13z"
    />
    {/* Red - Top arc */}
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.69 1.27 6.58l4.01 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
    />
  </Svg>
);

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onPress,
  loading = false,
  text = 'Tiếp tục với Google',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.button}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <>
          <View style={styles.iconContainer}>
            <OfficialGoogleLogo />
          </View>
          <Text style={styles.buttonText}>{text}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DADCE0',
    // Shadow completely removed per user request (flat design)
    elevation: 0,
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    marginTop: 14,
  },
  iconContainer: {
    marginRight: 10,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C4043',
    letterSpacing: 0.15,
  },
});
