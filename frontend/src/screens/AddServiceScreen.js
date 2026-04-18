import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import { createService } from "../services/serviceApi";

const AddServiceScreen = ({ navigation }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");

    const handleSubmit = async () => {
        if (!title || !description || !category || !price || !location) {
            return Alert.alert("Error", "Please fill all fields");
        }

        try {
            await createService({
                title,
                description,
                category,
                price: Number(price),
                location,
                availability: true,
                image: "",
            });

            Alert.alert("Success", "Service created!");

            navigation.goBack(); // go back to list
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Add Service</Text>

            <TextInput
                placeholder="Title"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
            />

            <TextInput
                placeholder="Description"
                style={styles.input}
                value={description}
                onChangeText={setDescription}
            />

            <TextInput
                placeholder="Category"
                style={styles.input}
                value={category}
                onChangeText={setCategory}
            />

            <TextInput
                placeholder="Price"
                style={styles.input}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
            />

            <TextInput
                placeholder="Location"
                style={styles.input}
                value={location}
                onChangeText={setLocation}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Create Service</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default AddServiceScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#CCDCDB",
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#135E4B",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#4CB572",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});