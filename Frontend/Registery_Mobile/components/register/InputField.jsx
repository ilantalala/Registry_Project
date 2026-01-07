import React from 'react';
import { View, TextInput } from 'react-native';
import { styles } from './register.styles';

export const InputField = ({ 
  icon: Icon, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  editable = true 
}) => {
  return (
    <View style={styles.inputWrapper}>
      <Icon size={20} color="#9ca3af" />
      <TextInput 
        placeholder={placeholder}
        style={styles.inputText}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        editable={editable}
      />
    </View>
  );
};