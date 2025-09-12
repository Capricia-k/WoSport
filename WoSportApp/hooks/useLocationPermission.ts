import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export default function useLocationPermission() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission refusée",
          "WoSport ne peut pas tracker votre session sans permission GPS"
        );
        setHasPermission(false);
      } else {
        setHasPermission(true);
      }
    };

    requestPermission();
  }, []);

  return hasPermission;
}
