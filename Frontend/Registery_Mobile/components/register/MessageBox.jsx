import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './register.styles';

export const MessageBox = ({ message, type }) => {
  if (!message) return null;

  const containerStyle = type === 'error' ? styles.errorContainer : styles.successContainer;
  const textStyle = type === 'error' ? styles.errorText : styles.successText;

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{message}</Text>
    </View>
  );
};