import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Mail, Lock, ShieldCheck, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { TokenStorage } from '../utils/tokenStorage';
import { styles } from '../components/register/register.styles';
import { MessageBox } from '../components/register/MessageBox';
import { GoogleButton } from '../components/register/GoogleButton';
import { Divider } from '../components/register/Divider';
import { InputField } from '../components/register/InputField';
import { SubmitButton } from '../components/register/SubmitButton';
import { Footer } from '../components/register/Footer';

WebBrowser.maybeCompleteAuthSession();

const API_URL = 'http://10.100.102.16:8000';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Debug logging
console.log('=== GOOGLE AUTH DEBUG ===');
console.log('API URL:', API_URL);
console.log('Android Client ID:', GOOGLE_ANDROID_CLIENT_ID);
console.log('Web Client ID:', GOOGLE_WEB_CLIENT_ID);
console.log('Platform:', Platform.OS);

// Create explicit redirect URI
const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true, // Use Expo's auth proxy
});

console.log('Generated Redirect URI:', redirectUri);
console.log('========================');

export default function RegisterScreen() {
  const router = useRouter();
  
  // State management
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google Sign-In configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: redirectUri, // Explicitly set redirect URI
  });

  // Debug auth request
  React.useEffect(() => {
    if (request) {
      console.log('=== AUTH REQUEST CREATED ===');
      console.log('Request Redirect URI:', request.redirectUri);
      console.log('Request URL:', request.url);
      console.log('Request Client ID:', request.clientId);
      console.log('===========================');
    }
  }, [request]);

  // Handle Google Sign-In response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Google auth success:', authentication);
      if (authentication?.idToken) {
        handleGoogleSignIn(authentication.idToken);
      }
    } else if (response?.type === 'error') {
      console.log('=== GOOGLE AUTH ERROR ===');
      console.log('Error type:', response.type);
      console.log('Error details:', response.error);
      console.log('Error params:', response.params);
      console.log('========================');
      setErrorMessage('Google sign-in failed. Please try again.');
    } else if (response?.type === 'cancel') {
      console.log('Google sign-in cancelled by user');
    }
  }, [response]);

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters)');
      return false;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    if (!validatePassword(formData.password)) {
      setErrorMessage('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }

    return true;
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async (idToken) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('Sending Google token to backend...');
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken
        }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok) {
        await TokenStorage.saveToken(data.access_token);
        await TokenStorage.saveUser(data.user);
        
        setSuccessMessage(data.toast_content || 'Login successful!');
        
        setTimeout(() => {
          router.replace('/home');
        }, 1500);
      } else {
        setErrorMessage(data.detail || 'Google sign-in failed. Please try again.');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email/password sign up
  const handleSignUp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      console.log('Registering user:', formData.email.trim());
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirm_password: formData.confirmPassword
        }),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok) {
        await TokenStorage.saveToken(data.access_token);
        await TokenStorage.saveUser(data.user);
        
        setSuccessMessage(data.toast_content || 'Account created successfully!');
        
        setTimeout(() => {
          router.replace('/home');
        }, 1500);
      } else {
        setErrorMessage(data.detail || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGooglePress = () => {
    console.log('=== GOOGLE BUTTON PRESSED ===');
    console.log('Request available:', !!request);
    console.log('Request redirect URI:', request?.redirectUri);
    console.log('============================');
    
    if (!request) {
      setErrorMessage('Google authentication is not ready. Please try again.');
      return;
    }
    
    promptAsync();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.blueHeader}>
            <Text style={styles.headerTitle}>Create Account</Text>
          </View>
            
          <View style={styles.formSection}>
            <MessageBox message={errorMessage} type="error" />
            <MessageBox message={successMessage} type="success" />

            <GoogleButton 
              onPress={handleGooglePress}
              disabled={!request || isLoading}
            />

            <Divider text="or sign up with email" />

            <InputField
              icon={User}
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={(value) => updateFormData('fullName', value)}
              autoCorrect={false}
              autoCapitalize="words"
              editable={!isLoading}
            />

            <InputField
              icon={Mail}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <InputField
              icon={Lock}
              placeholder="Password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <InputField
              icon={ShieldCheck}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            
            <SubmitButton
              onPress={handleSignUp}
              isLoading={isLoading}
              text="Sign Up"
            />
          </View>

          <Footer
            text="Already have an account?"
            linkText="Log in"
            onPress={() => router.push('/')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}