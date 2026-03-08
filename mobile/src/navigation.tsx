import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY } from './theme';

import HomeScreen from './screens/HomeScreen';
import WisdomScreen from './screens/WisdomScreen';
import PhilosophyScreen from './screens/PhilosophyScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import TermsScreen from './screens/TermsScreen';
import SuggestQuoteScreen from './screens/SuggestQuoteScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Philosophy: undefined;
  Privacy: undefined;
  Terms: undefined;
  SuggestQuote: undefined;
};

export type TabParamList = {
  Home: undefined;
  Wisdom: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function SkullIcon({ size, color }: { size: number; color: string }) {
  return <Text style={{ fontSize: size - 4, color }}>☠</Text>;
}

function BookIcon({ size, color }: { size: number; color: string }) {
  return <Text style={{ fontSize: size - 4, color }}>📖</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: COLORS.foreground,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: {
          fontFamily: FONT_FAMILY,
          fontSize: 9,
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'My Life',
          tabBarIcon: ({ size, color }) => <SkullIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Wisdom"
        component={WisdomScreen}
        options={{
          tabBarLabel: 'Wisdom',
          tabBarIcon: ({ size, color }) => <BookIcon size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Philosophy" component={PhilosophyScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="SuggestQuote" component={SuggestQuoteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
