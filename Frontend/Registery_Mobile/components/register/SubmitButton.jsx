import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styles } from './register.styles';

export const SubmitButton = ({ onPress, isLoading, text }) => {
  return (
    <TouchableOpacity 
      style={[styles.registerBtn, isLoading && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.registerBtnText}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};