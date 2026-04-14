import React from "react";
import { View, StyleSheet } from "react-native";
import ServiceCard from "./src/components/ServiceCard";

function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ServiceCard
        service={{
          title: "Plumbing Repair",
          category: "Plumbing",
          price: 2500,
          image:
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
        }}
        onPress={() => console.log("Clicked")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#CCDCDB",
    justifyContent: "center",
  },
});

export default App;