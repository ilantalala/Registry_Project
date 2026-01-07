import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './register.styles';

export const Divider = ({ text = 'or sign up with email' }) => {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
};