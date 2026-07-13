/** Expo Router layout with global providers and navigation. */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

import { useFonts, Nunito_900Black } from '@expo-google-fonts/nunito';

export default function Layout() {
  const isWeb = Platform.OS === 'web';
  const [fontsLoaded] = useFonts({
    Nunito_900Black,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={isWeb ? styles.webContainer : styles.nativeContainer}>
      <View style={isWeb ? styles.webAppWrapper : styles.nativeAppWrapper}>
        <StatusBar style="dark" backgroundColor={COLORS.bgLight} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.bgLight },
            headerTintColor: COLORS.primaryDark,
            headerTitleStyle: { fontWeight: '700' },
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: COLORS.bgLight },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'VaidyaVoice',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="result"
            options={{
              title: 'Triage Result',
            }}
          />
          <Stack.Screen
            name="graph-viz"
            options={{
              title: 'How It Thinks',
            }}
          />
          <Stack.Screen
            name="emergency"
            options={{
              title: 'Emergency',
              headerStyle: { backgroundColor: COLORS.red },
              headerTintColor: COLORS.white,
            }}
          />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#EBE5D9', // Slightly darker beige for the background
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeContainer: {
    flex: 1,
  },
  webAppWrapper: {
    width: '100%',
    maxWidth: 480, // Mobile width constraint
    height: '100%',
    backgroundColor: COLORS.bgLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  nativeAppWrapper: {
    flex: 1,
  },
});
