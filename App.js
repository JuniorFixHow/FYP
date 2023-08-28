import 'expo-firestore-offline-persistence'
import 'expo-dev-client';
import React from 'react';

import {AuthContextProvider } from './src/app/components/context/authContext/AuthContext';
import AuthScreens from './src/app/screens/auth/AuthScreens';
import { SettingsContextProvider } from './src/app/components/context/settings/SettingsContext';
import { FetchUsersContextProvider } from './src/app/components/context/fetch/fetchUsersContext';
// import registerNNPushToken from 'native-notify';



  export default function App() {
    // registerNNPushToken(9298, 'jBjeFjhubb8SwW2aYHDxRP');

  return (
   
      <SettingsContextProvider>
        <AuthContextProvider>
    <FetchUsersContextProvider>
          <AuthScreens />
    </FetchUsersContextProvider>
        </AuthContextProvider>
      </SettingsContextProvider>
  );
}

