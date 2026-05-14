import React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import type { CiudadanoAuthParamList, CiudadanoTabParamList } from './types';

// ── Screens ──────────────────────────────────────────────────────────────────
import { LoginScreen }          from '../screens/Ciudadano/LoginScreen';
import { RegistroScreen }       from '../screens/Ciudadano/RegistroScreen';
import { MiSaludScreen }        from '../screens/Ciudadano/MiSaludScreen';
import { MiCartillaScreen }     from '../screens/Ciudadano/MiCartillaScreen';
import { AsistenteCiudadanoScreen } from '../screens/Ciudadano/AsistenteCiudadanoScreen';

const AuthStack = createNativeStackNavigator<CiudadanoAuthParamList>();
const Tab       = createBottomTabNavigator<CiudadanoTabParamList>();

// ── Auth Stack (Login / Registro) ─────────────────────────────────────────────

const CiudadanoAuthStack = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login"    component={LoginScreen} />
    <AuthStack.Screen name="Registro" component={RegistroScreen} />
  </AuthStack.Navigator>
);

// ── Logout button ────────────────────────────────────────────────────────────

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const confirm = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Deseas salir de tu cuenta?')) logout();
      return;
    }
    Alert.alert('Cerrar sesión', '¿Deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };
  return (
    <TouchableOpacity onPress={confirm} style={styles.logoutBtn}>
      <Ionicons name="log-out-outline" size={22} color={colors.neutral[500]} />
    </TouchableOpacity>
  );
};

// ── Tab Icons ─────────────────────────────────────────────────────────────────

const tabIcons: Record<
  keyof CiudadanoTabParamList,
  { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }
> = {
  MiSalud:            { focused: 'heart',          unfocused: 'heart-outline' },
  MiCartilla:         { focused: 'document-text',  unfocused: 'document-text-outline' },
  AsistenteCiudadano: { focused: 'chatbubble-ellipses', unfocused: 'chatbubble-ellipses-outline' },
};

// ── Tab Navigator (área personal del ciudadano) ───────────────────────────────

const CiudadanoTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: true,
      headerRight: () => <LogoutButton />,
      headerStyle: { backgroundColor: colors.background.primary },
      headerShadowVisible: false,
      headerTitleStyle: { fontSize: 17, fontWeight: '700', color: colors.neutral[800] },
      tabBarIcon: ({ focused, color }) => {
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
      tabBarActiveTintColor:   colors.secondary[500],
      tabBarInactiveTintColor: colors.neutral[400],
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
      tabBarItemStyle:  styles.tabItem,
    })}
  >
    <Tab.Screen name="MiSalud"     component={MiSaludScreen}
      options={{ tabBarLabel: 'Mi Salud', title: 'Mi Salud' }} />
    <Tab.Screen name="MiCartilla"  component={MiCartillaScreen}
      options={{ tabBarLabel: 'Mi Cartilla', title: 'Mi Cartilla' }} />
    <Tab.Screen name="AsistenteCiudadano" component={AsistenteCiudadanoScreen}
      options={{ tabBarLabel: 'Asistente IA', title: 'Asistente IA' }} />
  </Tab.Navigator>
);

// ── CiudadanoNavigator (raíz) ─────────────────────────────────────────────────

export const CiudadanoNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <CiudadanoTabNavigator /> : <CiudadanoAuthStack />}
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
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  tabItem:  { paddingTop: 4 },
  activeIconWrap: {
    backgroundColor: colors.secondary[50],
    borderRadius: 12,
    padding: 6,
    marginBottom: -4,
  },
  logoutBtn: { paddingHorizontal: 16, paddingVertical: 8 },
});
