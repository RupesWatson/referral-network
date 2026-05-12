import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { getPassword } from '../utils/storage';

export default function LoginScreen({ onLogin }) {
  const [pin, setPin]         = useState('');
  const [error, setError]     = useState('');
  const [checking, setChecking] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!pin.trim()) return;
    setChecking(true);
    const correct = await getPassword();
    setChecking(false);
    if (pin === correct) {
      setError('');
      onLogin();
    } else {
      setPin('');
      setError('Incorrect password. Try again.');
      shake();
    }
  };

  const handlePinChange = (text) => {
    setPin(text);
    if (error) setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        {/* Logo / branding */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>RN</Text>
          </View>
        </View>

        <Text style={styles.title}>Referral Network</Text>
        <Text style={styles.subtitle}>Enter your password to continue</Text>

        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={pin}
            onChangeText={handlePinChange}
            secureTextEntry
            keyboardType="default"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            autoFocus
          />
        </Animated.View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, checking && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={checking}
          activeOpacity={0.85}
        >
          {checking
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Unlock</Text>
          }
        </TouchableOpacity>

        <Text style={styles.hint}>Default password: 1234</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f4f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  logoWrap:   { marginBottom: 16 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#185fa5', alignItems: 'center', justifyContent: 'center' },
  logoText:   { color: '#fff', fontSize: 22, fontWeight: '700' },
  title:      { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 6 },
  subtitle:   { fontSize: 13, color: '#888', marginBottom: 28 },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 4,
  },
  inputError: { borderColor: '#e53e3e' },
  errorText:  { color: '#e53e3e', fontSize: 12, marginBottom: 12, textAlign: 'center' },
  btn: {
    width: '100%',
    backgroundColor: '#185fa5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  hint: { marginTop: 20, fontSize: 11, color: '#bbb' },
});
