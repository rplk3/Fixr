import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ServicesListScreen from "../screens/ServicesListScreen";
import ServiceDetailsScreen from "../screens/ServiceDetailsScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Services"
          component={ServicesListScreen}
        />
        <Stack.Screen
          name="Details"
          component={ServiceDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;