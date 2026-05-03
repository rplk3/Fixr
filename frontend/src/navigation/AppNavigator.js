import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ServicesListScreen from "../screens/ServicesListScreen";
import ServiceDetailsScreen from "../screens/ServiceDetailsScreen";
import AddServiceScreen from "../screens/AddServiceScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ProviderDashboardScreen from "../screens/ProviderDashboardScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import BookingScreen from "../screens/BookingScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import PaymentScreen from "../screens/PaymentScreen";
import MyProfileScreen from "../screens/MyProfileScreen";
import AdminPaymentDetailsScreen from "../screens/AdminPaymentDetailsScreen";
import ComplaintsScreen from "../screens/ComplaintsScreen";
import AdminComplaintDetailsScreen from "../screens/AdminComplaintDetailsScreen";
import AdminBookingDetailsScreen from "../screens/AdminBookingDetailsScreen";

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
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Details"
          component={ServiceDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddService"
          component={AddServiceScreen}
          options={{ headerShown: true, title: "Add Service" }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: true, title: "Provider Application" }}
        />
        <Stack.Screen
          name="ProviderDashboard"
          component={ProviderDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyBookings"
          component={MyBookingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyProfile"
          component={MyProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminPaymentDetails"
          component={AdminPaymentDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Complaints"
          component={ComplaintsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminComplaintDetails"
          component={AdminComplaintDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminBookingDetails"
          component={AdminBookingDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminUsers"
          component={require("../screens/AdminUsersScreen").default}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminUserDetails"
          component={require("../screens/AdminUserDetailsScreen").default}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminCreateUser"
          component={require("../screens/AdminCreateUserScreen").default}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminEditUser"
          component={require("../screens/AdminEditUserScreen").default}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;