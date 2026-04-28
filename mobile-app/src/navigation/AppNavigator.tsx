import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme';
import type {
  RootTabParamList,
  PacientesStackParamList,
  BrotesStackParamList,
} from './types';

// ── Screens ──────────────────────────────────────────────────────────
import { HomeScreen } from '../screens/Home/HomeScreen';
import { PacientesListScreen } from '../screens/Pacientes/PacientesListScreen';
import { PacienteDetalleScreen } from '../screens/Pacientes/PacienteDetalleScreen';
import { RegistrarPacienteScreen } from '../screens/Pacientes/RegistrarPacienteScreen';
import { VacunarScreen } from '../screens/Vacunar/VacunarScreen';
import { BrotesScreen } from '../screens/Brotes/BrotesScreen';
import { AsistenteIAScreen } from '../screens/Brotes/AsistenteIAScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const PacientesStack = createNativeStackNavigator<PacientesStackParamList>();
const BrotesStack = createNativeStackNavigator<BrotesStackParamList>();

// ── Stack Navigators ─────────────────────────────────────────────────

const PacientesStackNavigator = () => (
  <PacientesStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <PacientesStack.Screen name="PacientesList" component={PacientesListScreen} />
    <PacientesStack.Screen
      name="PacienteDetalle"
      component={PacienteDetalleScreen}
      options={{
        headerShown: true,
        headerTitle: 'Perfil del Paciente',
        headerTintColor: colors.primary[600],
        headerStyle: { backgroundColor: colors.background.primary },
        headerShadowVisible: false,
      }}
    />
    <PacientesStack.Screen
      name="RegistrarPaciente"
      component={RegistrarPacienteScreen}
      options={{
        headerShown: true,
        headerTitle: 'Nuevo Paciente',
        headerTintColor: colors.primary[600],
        headerStyle: { backgroundColor: colors.background.primary },
        headerShadowVisible: false,
      }}
    />
  </PacientesStack.Navigator>
);

const BrotesStackNavigator = () => (
  <BrotesStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <BrotesStack.Screen name="BrotesList" component={BrotesScreen} />
    <BrotesStack.Screen
      name="AsistenteIA"
      component={AsistenteIAScreen}
      options={{
        headerShown: true,
        headerTitle: 'Asistente IA',
        headerTintColor: colors.primary[600],
        headerStyle: { backgroundColor: colors.background.primary },
        headerShadowVisible: false,
      }}
    />
  </BrotesStack.Navigator>
);

// ── Tab icons ────────────────────────────────────────────────────────

const tabIcons: Record<
  keyof RootTabParamList,
  { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }
> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Pacientes: { focused: 'people', unfocused: 'people-outline' },
  Vacunar: { focused: 'medkit', unfocused: 'medkit-outline' },
  Brotes: { focused: 'warning', unfocused: 'warning-outline' },
};

// ── Main Navigator ───────────────────────────────────────────────────

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = tabIcons[route.name];
            return (
              <View style={focused ? styles.activeIconWrap : undefined}>
                <Ionicons
                  name={focused ? icons.focused : icons.unfocused}
                  size={focused ? 24 : 22}
                  color={color}
                />
              </View>
            );
          },
          tabBarActiveTintColor: colors.primary[500],
          tabBarInactiveTintColor: colors.neutral[400],
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: 'Inicio' }}
        />
        <Tab.Screen
          name="Pacientes"
          component={PacientesStackNavigator}
          options={{ tabBarLabel: 'Pacientes' }}
        />
        <Tab.Screen
          name="Vacunar"
          component={VacunarScreen}
          options={{ tabBarLabel: 'Vacunar' }}
        />
        <Tab.Screen
          name="Brotes"
          component={BrotesStackNavigator}
          options={{ tabBarLabel: 'Brotes' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    paddingBottom: 8,
    paddingTop: 8,
    ...shadows.lg,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 4,
  },
  activeIconWrap: {
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: 6,
    marginBottom: -4,
  },
});
