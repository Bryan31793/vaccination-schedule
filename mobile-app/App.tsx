import React, { useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { AppNavigator }          from './src/navigation/AppNavigator';
import { CiudadanoNavigator }    from './src/navigation/CiudadanoNavigator';
import { RoleSelectionScreen }   from './src/screens/RoleSelection/RoleSelectionScreen';
import { AuthProvider }          from './src/context/AuthContext';
import { MedicoAuthProvider }    from './src/context/MedicoAuthContext';
import { BackPortalProvider }    from './src/context/BackPortalContext';
import { ChatProvider }          from './src/context/ChatContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

type UserRole = 'medico' | 'ciudadano' | null;

// En web, recupera el rol desde localStorage sincrónicamente para evitar
// el flash a RoleSelectionScreen en cada recarga de página (F5).
function getInitialRole(): UserRole {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    if (localStorage.getItem('medico_token')) return 'medico';
  }
  return null;
}

export default function App() {
  const [role, setRole] = useState<UserRole>(getInitialRole);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ChatProvider>
          {role === null && (
            <RoleSelectionScreen onSelect={setRole} />
          )}
          {role === 'medico' && (
            <BackPortalProvider onBack={() => setRole(null)}>
              <MedicoAuthProvider>
                <AppNavigator />
              </MedicoAuthProvider>
            </BackPortalProvider>
          )}
          {role === 'ciudadano' && (
            <BackPortalProvider onBack={() => setRole(null)}>
              <AuthProvider>
                <CiudadanoNavigator />
              </AuthProvider>
            </BackPortalProvider>
          )}
        </ChatProvider>
      </QueryClientProvider>
      <Toast />
    </SafeAreaProvider>
  );
}
