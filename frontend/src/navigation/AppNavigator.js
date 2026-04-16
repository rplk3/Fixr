import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import SellerRegisterScreen from "../screens/SellerRegisterScreen";
import AddServiceScreen from "../screens/AddServiceScreen";
import ServicesListScreen from "../screens/ServicesListScreen";
import ServiceDetailsScreen from "../screens/ServiceDetailsScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SellerRegister" component={SellerRegisterScreen} />
        <Stack.Screen name="Services" component={ServicesListScreen} />
        <Stack.Screen name="Details" component={ServiceDetailsScreen} />
        <Stack.Screen name="AddService" component={AddServiceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;