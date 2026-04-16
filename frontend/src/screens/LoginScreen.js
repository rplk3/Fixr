import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { loginUser } from "../services/authApi";

let savedToken = null;
export const getToken = () => savedToken;

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            return Alert.alert("Error", "Please enter email and password");
        }

        try {
            setLoading(true);
            const data = await loginUser(email, password);

            // Store token
            savedToken = data.token;

            // Navigate based on role
            if (data.user.role === "seller") {
                navigation.replace("Services"); // seller goes to manage services
            } else {
                navigation.replace("Services"); // customer goes to browse services
            }
        } catch (error) {
            Alert.alert("Login Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Fixr</Text>
            <Text style={styles.subtitle}>Login to continue</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("SellerRegister")}>
                <Text style={styles.sellerText}>Become a service seller</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#CCDCDB",
        justifyContent: "center",
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#135E4B",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#4CB572",
        textAlign: "center",
        marginBottom: 30,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        color: "#000",
    },
    loginButton: {
        backgroundColor: "#4CB572",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
    },
    loginButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    sellerText: {
        color: "#135E4B",
        textAlign: "center",
        fontWeight: "600",
    },
});