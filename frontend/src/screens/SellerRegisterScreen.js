import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";

const SellerRegisterScreen = ({ navigation }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = () => {
        if (
            !firstName ||
            !lastName ||
            !mobileNumber ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return Alert.alert("Error", "Please fill all fields");
        }

        if (password !== confirmPassword) {
            return Alert.alert("Error", "Passwords do not match");
        }

        Alert.alert("Success", "Seller registration API will be connected next");
        navigation.goBack();
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Seller Registration</Text>

            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
            />

            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
            />

            <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register as Seller</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default SellerRegisterScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#CCDCDB",
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#135E4B",
        marginBottom: 24,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        color: "#000",
    },
    button: {
        backgroundColor: "#4CB572",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});