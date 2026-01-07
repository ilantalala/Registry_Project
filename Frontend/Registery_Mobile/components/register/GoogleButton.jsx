import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from './register.styles';

export const GoogleButton = ({ onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={styles.googleButton}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.googleIcon}>🔍</Text>
      <Text style={styles.googleButtonText}>
        Continue with Google
      </Text>
    </TouchableOpacity>
  );
};