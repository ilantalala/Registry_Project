import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { TokenStorage } from '../utils/tokenStorage';
import { styles } from '../components/login/login.styles';

const API_URL = 'http://localhost:8000';

export default function LoginScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await TokenStorage.saveToken(data.access_token);
        await TokenStorage.saveUser(data.user);
        
        setSuccessMessage(data.toast_content || 'Login successful!');
        
        setTimeout(() => {
          router.replace('/home');
        }, 1000);
      } else {
        setErrorMessage(data.detail || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.blueHeader}>
              <Text style={styles.illustrationEmoji}>🚀</Text>
              <Text style={styles.headerTitle}>Welcome aboard my friend</Text>
              <Text style={styles.headerSubtitle}>just a couple of clicks and we start</Text>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Log in</Text>

              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {successMessage ? (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>
                    {successMessage}
                  </Text>
                </View>
              ) : null}

              <View style={styles.inputWrapper}>
                <Mail size={20} color="#9ca3af" />
                <TextInput 
                  placeholder="Email" 
                  style={styles.inputText} 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9ca3af" />
                <TextInput 
                  placeholder="Password" 
                  style={styles.inputText} 
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>Log in</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.registerLink}
                onPress={() => router.push('/register')}
                disabled={isLoading}
              >
                <Text style={styles.registerLinkText}>
                  Have no account yet? Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}