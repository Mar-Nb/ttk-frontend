import { Platform, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

export default function JoinScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>Screen Join!</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Prêt")}>
          <Text>Valider</Text>
        </TouchableOpacity>

        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
});
