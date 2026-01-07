import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './register.styles';

export const Footer = ({ onPress, text, linkText }) => {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>{text} </Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.linkText}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
};