import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MedicoAuthParamList } from './types';
import { LoginMedicoScreen } from '../screens/Auth/LoginMedicoScreen';
import { RegistroMedicoScreen } from '../screens/Auth/RegistroMedicoScreen';

const Stack = createNativeStackNavigator<MedicoAuthParamList>();

export const MedicoAuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LoginMedico"    component={LoginMedicoScreen} />
    <Stack.Screen name="RegistroMedico" component={RegistroMedicoScreen} />
  </Stack.Navigator>
);
