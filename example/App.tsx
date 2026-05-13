import React, { useEffect } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import axios from "axios";
import { AltechApiInspector, attachAxiosInspector, initApiInspector } from "../src";

if (__DEV__) {
  initApiInspector({ mode: "console", console: { maxBodyLength: 2000 } });
  attachAxiosInspector(axios, { mode: "console" });
}

export default function App() {
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos/1").catch(() => undefined);
  }, []);

  const triggerRequests = async () => {
    try {
      await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "hello", body: "world", userId: 1 }),
      });

      await axios.get("https://jsonplaceholder.typicode.com/users");
    } catch {
      // noop
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Altech API Inspector Example</Text>
        <Pressable onPress={triggerRequests} style={styles.button}>
          <Text style={styles.buttonText}>Trigger API Requests</Text>
        </Pressable>
      </View>

      {__DEV__ && <AltechApiInspector mode="both" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111827",
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
