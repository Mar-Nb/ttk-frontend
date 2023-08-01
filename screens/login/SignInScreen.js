import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, SafeAreaView, StatusBar, KeyboardAvoidingView, TextInput } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BACKEND_URL } from '../../Constants';
import { useDispatch } from 'react-redux';
import { login } from '../../reducers/users';

export default function SignInScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const dispatch = useDispatch();

	/**
	 * Fonction envoyant le pseudo et le mot de passe au backend
	 */
	const handleSignIn = async () => {
		if (email !== "" && password !== "") {
			const response = await fetch(`${BACKEND_URL}/users/signin`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const hasAccount = await response.json();
			if (hasAccount.result) {
				setEmail("");
				setPassword("");
				dispatch(login(hasAccount.token));
				navigation.navigate('TabNavigator', { screen: 'Communauté' });
			} else {
				console.log('Error', hasAccount.error);
			}
		}
	};

	return (
		<SafeAreaView style={styles.container} >
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
				<View style={styles.textContent}>
					<Text style={styles.h1}>Toutenkommun</Text>
					<Text style={styles.h5}>Connectes-toi et partage !</Text>
				</View>

				<View style={styles.btnConnect}>
					<TouchableOpacity style={styles.btnFB} activeOpacity={0.8}>
						<FontAwesome name='facebook' size={20} color='#F8FCFB' />
						<Text style={styles.textBtnFB}>Facebook</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.btnGG} activeOpacity={0.8}>
						<FontAwesome name='google' size={20} color='#F8FCFB' />
						<Text style={styles.textBtnGG}>Google</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.inputContent}>
					<View style={styles.userContent}>
						<FontAwesome style={styles.userIcon} name='user' size={20} color='#353639' />
						<TextInput style={{ width: 225 }} placeholder="Email" placeholderTextColor='#353639' autoCapitalize='none' inputMode='email' value={email} onChangeText={(e) => setEmail(e.trim())} />
					</View>

					<View style={styles.mdpContent}>
						<FontAwesome style={styles.mdpIcon} name='lock' size={20} color='#353639' />
						<TextInput style={{ width: 225 }} placeholder="Mot de passe" placeholderTextColor='#353639' value={password} secureTextEntry={true} onChangeText={(e) => setPassword(e.trim())} />
					</View>
				</View>

				<View style={styles.btnValidateContent}>
					<TouchableOpacity style={styles.btnValidate} onPress={handleSignIn}>
						<FontAwesome style={styles.handIcon} name='hand-o-right' size={20} color='#353639' />
						<Text style={styles.btnTextValidate}>Valider</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.bar} />

				<View style={styles.createContent}>
					<Text style={styles.h5}>Pas encore sur Toutenkommun ?</Text>
					<Text style={styles.h5}>Crée un compte et rejoins-nous !</Text>
				</View>

				<View style={styles.btnCreateContent}>
					<TouchableOpacity style={styles.btnCreate} onPress={() => navigation.navigate("SignUp")}>
						<FontAwesome style={styles.userxIcon} name='user-plus' size={20} color='#353639' />
						<Text style={styles.btnTextCreate}>Créer un compte</Text>
					</TouchableOpacity>
				</View>

				<StatusBar style="auto" />
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
		backgroundColor: '#F8FCFB',
		fontFamily: 'Tuffy-Regular'
	},
	textContent: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: '10%',
	},
	h1: {
		fontSize: 40,
		fontWeight: 'bold',
		color: '#353639',
	},
	h5: {
		fontSize: 20,
		color: '#353639',
	},
	btnConnect: {
		height: '15%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-evenly',
	},
	btnFB: {
		flexDirection: 'row',
		height: '40%',
		width: '35%',
		backgroundColor: '#3B5998',
		justifyContent: 'space-evenly',
		alignItems: 'center',
		borderRadius: 10,
	},
	btnGG: {
		flexDirection: 'row',
		height: '40%',
		width: '35%',
		backgroundColor: '#DE4B39',
		justifyContent: 'space-evenly',
		alignItems: 'center',
		borderRadius: 10,
	},
	textBtnFB: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold'
	},
	textBtnGG: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold'
	},
	inputContent: {
		height: '25%',
		alignItems: 'center',
		justifyContent: 'space-evenly',
	},
	userContent: {
		flexDirection: 'row',
		height: '30%',
		width: '87%',
		borderWidth: 2,
		borderColor: '#198EA5',
		borderRadius: 10,
		paddingLeft: '5%',
		alignItems: 'center'
	},
	userIcon: {
		padding: 10,
	},
	mdpContent: {
		flexDirection: 'row',
		height: '30%',
		width: '87%',
		borderWidth: 2,
		borderColor: '#198EA5',
		borderRadius: 10,
		paddingLeft: '5%',
		alignItems: 'center'
	},
	mdpIcon: {
		padding: 10,
	},
	btnValidateContent: {
		height: '15%',
		alignItems: 'center',
	},
	btnValidate: {
		flexDirection: 'row',
		height: '50%',
		width: '87%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#198EA5',
		borderRadius: 10,
	},
	handIcon: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		marginRight: 10
	},
	btnTextValidate: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		marginRight: 16
	},
	bar: {
		borderBottomColor: '#198EA5',
		borderBottomWidth: 2,
		width: '87%',
		textAlign: 'center',
		marginLeft: 'auto',
		marginRight: 'auto',
		marginBottom: '5%'
	},
	createContent: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnCreateContent: {
		height: '15%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnCreate: {
		flexDirection: 'row',
		height: '50%',
		width: '87%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F8FCFB',
		borderBottomColor: '#198EA5',
		borderBottomWidth: 2,
		borderLeftColor: '#198EA5',
		borderLeftWidth: 2,
		borderTopColor: '#198EA5',
		borderTopWidth: 2,
		borderRightColor: '#198EA5',
		borderRightWidth: 2,
		borderRadius: 10,
	},
	btnTextCreate: {
		color: '#198EA5',
		fontSize: 20,
		fontWeight: 'bold'
	},
	userxIcon: {
		color: '#198EA5',
		fontSize: 20,
		fontWeight: 'bold',
		marginRight: 10
	},
});