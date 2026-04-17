import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ServicesListScreen from "../screens/ServicesListScreen";
import ServiceDetailsScreen from "../screens/ServiceDetailsScreen";
import AddServiceScreen from "../screens/AddServiceScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen
          name="Services"
          component={ServicesListScreen}
          options={{ headerShown: true, title: "Services", headerLeft: () => null }}
        />
        <Stack.Screen
          name="Details"
          component={ServiceDetailsScreen}
          options={{ headerShown: true, title: "Service Details" }}
        />
        <Stack.Screen
          name="AddService"
          component={AddServiceScreen}
          options={{ headerShown: true, title: "Add Service" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;