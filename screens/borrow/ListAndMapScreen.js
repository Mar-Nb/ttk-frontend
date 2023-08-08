import React, { useState, useEffect } from "react";
import {
	Platform,
	SafeAreaView,
	StatusBar,
	StyleSheet,
	Text,
	View,
	KeyboardAvoidingView,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Modal,
	ActivityIndicator,
	Dimensions
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { BACKEND_URL } from "../../Constants";
import { useSelector } from "react-redux";



// Composant principal
export default function ListAndMapScreen({ route, navigation }) {
	// États pour gérer l'onglet sélectionné, la localisation, l'élément sélectionné et la modal
	const [selectedTab, setSelectedTab] = useState("Liste");
	const [location, setLocation] = useState(null);
	const [selectedItem, setSelectedItem] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedItemInfo, setSelectedItemInfo] = useState(null);
	const [mapObjects, setMapObjects] = useState([]);
	const [isBorrowModalVisible, setIsBorrowModalVisible] = useState(false); // State to manage modal visibility
	const [data, setData] = useState([]);

	const [searchLoading, setSearchLoading] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");

	const [modalFilterVisible, setModalFilterVisible] = useState(false);
	const [userCommunities, setUserCommunities] = useState([]);

	const token = useSelector((state) => state.users.token);

	// Effet pour demander et surveiller les autorisations de localisation
	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();

			if (status === "granted") {
				// Localisation de la position
				Location.watchPositionAsync({ distanceInterval: 10 }, (location) => {
					setLocation(location);
				});
			}
		})();

		// Récupération des communautés de User
		(async () => {
			const response = await fetch(`${BACKEND_URL}/communities/${token}`);
			let userData = await response.json();
			userData = userData.communities.map(commu => { return { ...commu, selected: true }; });
			setUserCommunities(userData);
		})();
	}, []);

	useEffect(() => {
		if (!searchTerm || searchTerm === "") {
			setSearchResults(null);
			fetchFeed();
		}
	}, [searchTerm]);

	// Gère la sélection d'un élément de la liste
	const handleItemPress = async (item) => {
		setSelectedItem(item === selectedItem ? null : item);
		setSelectedItemInfo(item === selectedItemInfo ? null : item);
		console.log("selectedItemInfo 1", selectedItemInfo)
		setIsModalVisible(true);

		// Récupère les objets pour la carte
		const mapResults = await fetchFeed(item);
		setMapObjects(mapResults);
	};

	const fetchFeed = async () => {
		try {
			const response = await fetch(`${BACKEND_URL}/communities/feed/${token}`);

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			const mapMarkersData = data.items.map((item) => ({
				title: item.name,
				latitude: item.owner.address.latitude,
				longitude: item.owner.address.longitude,
				distance: item.distance,
			}));
			setMapObjects(mapMarkersData);
			setData(data.items);
		} catch (error) {
			console.error("Une erreur s'est produite:", error);
		}
	};

	const fetchSearchResults = async (item) => {
		try {
			setSearchLoading(true);

			const response = await fetch(`${BACKEND_URL}/search`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: token,
					name: item,
					communitiesId: userCommunities.filter(commu => commu.selected).map(commu => commu._id)
				}),
			});

			const data = await response.json();

			if (data.result) {
				const mapMarkersData = data.searchresult.map((item) => ({
					title: item.name,
					latitude: item.owner.address.latitude,
					longitude: item.owner.address.longitude,
					distance: item.distance,
				}));

				setMapObjects(mapMarkersData);
				setSearchResults(data.searchresult);
			} else {
				console.log("Erreur de recherche :", data.error);
				setSearchResults([]);
			}
		} catch (error) {
			console.log("Erreur :", error.message);
			setSearchResults([]);
		} finally {
			setSearchLoading(false);
		}
	};

	/**
	 * Fonction pour emprunter un objet
	 */
	const handleBorrow = async () => {
		const response = await fetch(`${BACKEND_URL}/transactions/borrow/${token}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ _id: selectedItemInfo._id })
		});

		const data = await response.json();

		if (response.ok) {
			fetchFeed();
		} else {
			console.log(data.error);
		}
	};

	const handleBorrowButtonPress = () => {
		setIsBorrowModalVisible(true);
	};

	const filterSelectedCommu = (indice) => {
		const filtered = userCommunities.map((commu, i) => {
			if (i === indice) {
				let obj = { ...commu };
				obj['selected'] = !commu['selected'];
				return obj;
			}
			else { return commu; }
		});

		setUserCommunities(filtered);
	};

	// SearchRes ne sera défini qu'après l'initialisation du composant
	const searchRes = searchResults && searchResults.map((item, index) => (
		<TouchableOpacity
			key={index}
			style={[
				styles.listItem,
				selectedItem === item && styles.selectedItem,
			]}
			onPress={() => handleItemPress(item)}
		>
			<FontAwesome
				name={item.icon}
				size={20}
				color="black"
				style={styles.iconFilter}
			/>

			<Text style={styles.itemTitleObj}>{item.name}</Text>
			<Text style={styles.username}>{item.owner.username}</Text>
			{item.isAvailable && (
				<Text style={styles.dispoText}>Dispo !</Text>
			)}
			{item.distance && (
				<Text style={styles.distanceText}>
					{item.distance} km
				</Text>
			)}
		</TouchableOpacity>
	));

	const feedRes = data.map((item, index) => (
		<TouchableOpacity
			key={index}
			style={[
				styles.listItem,
				selectedItem === item && styles.selectedItem,
			]}
			onPress={() => handleItemPress(item)}
		>
			<FontAwesome
				name={item.icon}
				size={20}
				color="black"
				style={styles.iconFilter}
			/>

			<Text style={styles.itemTitleObj}>{item.name}</Text>
			<Text style={styles.username}>{item.owner.username}</Text>
			{item.isAvailable && (
				<Text style={styles.dispoText}>Dispo !</Text>
			)}
			{item.distance && (
				<Text style={styles.distanceText}>
					{item.distance} km
				</Text>
			)}
		</TouchableOpacity>
	));

	// Rendu du composant
	return (
		<SafeAreaView>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				{/* En-tête */}
				<View style={styles.header}>
					<Text style={styles.title}>TOUTENKOMMUN</Text>
					<FontAwesome
						style={styles.userIcon}
						name="user"
						size={20}
						color="white"
					/>
				</View>
				<StatusBar style="auto" />

				{/* Section de recherche */}
				<View style={styles.contentTop}>
					<Text style={styles.titleh}>
						Fil d'actualité de
						<Text style={styles.titleh1}> [ma communauté]</Text>
					</Text>
					<View style={styles.rowSearch}>
						<View style={styles.row}>
							<FontAwesome
								name="search"
								size={20}
								color="#198EA5"
								style={styles.iconSearch}
							/>
							<TextInput
								placeholder="Je recherche..."
								autoCapitalize="none"
								value={searchTerm}
								onChangeText={setSearchTerm}
							/>
						</View>
						<TouchableOpacity
							activeOpacity={0.8}
							onPress={() => {
								if (searchTerm) {
									console.log("searchTerm:", searchTerm)
									fetchSearchResults(searchTerm);
								}
							}}
						>
							<View style={{ backgroundColor: '#198EA5', height: 40, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 10 }}>
								<FontAwesome name="search" size={20} color='white' />
							</View>
						</TouchableOpacity>

						<TouchableOpacity activeOpacity={0.8} onPress={() => {setModalFilterVisible(true); console.log("commu", userCommunities)}}>
							<View style={styles.filter}>
								<FontAwesome
									name="sliders"
									size={20}
									color="#EEFCFF"
									style={styles.iconFilter}
								/>
							</View>
						</TouchableOpacity>
					</View>
				</View>

				{/* Barre de navigation entre Liste et Carte */}
				<View style={styles.rowMenu}>
					<TouchableOpacity onPress={() => setSelectedTab("Liste")}>
						<View
							style={[
								styles.iconTextContainer,
								selectedTab === "Liste" && styles.selectedTab,
							]}
						>
							<FontAwesome
								style={styles.listIcon}
								name="list"
								size={20}
								color={selectedTab === "Liste" ? "#198EA5" : "#198EA5"}
							/>
							<Text
								style={[
									styles.iconText,
									selectedTab === "Liste" && styles.selectedTabText,
								]}
							>
								Liste
							</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => setSelectedTab("Carte")}>
						<View
							style={[
								styles.iconTextContainer,
								selectedTab === "Carte" && styles.selectedTab,
							]}
						>
							<FontAwesome
								style={styles.mapIcon}
								name="map"
								size={20}
								color={selectedTab === "Carte" ? "#198EA5" : "#198EA5"}
							/>
							<Text
								style={[
									styles.iconText,
									selectedTab === "Carte" && styles.selectedTabText,
								]}
							>
								Carte
							</Text>
						</View>
					</TouchableOpacity>
				</View>

				{/* Contenu principal */}
				<View style={styles.contentList}>
					{selectedTab === "Liste" ? (
						// Liste des éléments
						<ScrollView>
							{/* Loading spinner pendant le chargement de la recherche */}
							<ActivityIndicator animating={searchLoading} size="large" color="#198EA5" />

							{/* Affichage du résultat de la recherche */}
							{selectedTab === "Liste" && searchRes ? searchRes : undefined}

							{/* Affichge du feed de base */}
							{selectedTab === "Liste" && !searchRes ? feedRes : undefined}
						</ScrollView>
					) : (
						// Carte avec localisation
						<View style={styles.mapContainer}>
							{selectedTab === "Carte" && location && (
								<MapView
									style={styles.map}
									initialRegion={{
										latitude: location?.coords?.latitude || 37.78825,
										longitude: location?.coords?.longitude || -122.4324,
										latitudeDelta: 0.8,
										longitudeDelta: 0.8,
									}}
								>
									{mapObjects.map((mapObj, i) => {
										// Corrected variable name
										console.log("Marker:", mapObj);
										return (
											<Marker
												key={i}
												coordinate={{
													latitude: mapObj.latitude,
													longitude: mapObj.longitude,
												}}
												title={mapObj.title}
												description={`Distance: ${mapObj.distance} km`}
											/>
										);
									})}
								</MapView>
							)}
						</View>
					)}
				</View>

				{/* Modal pour afficher les détails de l'élément sélectionné */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={isModalVisible}
					onRequestClose={() => {
						setIsModalVisible(false);
					}}
				>
					<View style={styles.modalContainer}>
						{selectedItemInfo && (
							<View style={styles.modalContent}>
								<Text style={styles.modalTitle}>{selectedItemInfo.name}</Text>

								<Text>de : {selectedItemInfo.owner.username}</Text>
								<TouchableOpacity
									onPress={handleBorrowButtonPress}
									style={styles.emprunterButton}
								>
									<FontAwesome
										name="check"
										size={20}
										color="white"
										style={styles.iconEmprunter}
									/>
									<Text style={styles.emprunterButtonText}>Emprunter</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => {
										setIsModalVisible(false);
									}}
									style={styles.modalCloseButton}
								>
									<Text style={styles.modalCloseButtonText}>Fermer</Text>
								</TouchableOpacity>
							</View>
						)}
						{/* Borrow Modal */}
						<Modal
							animationType="slide"
							transparent={true}
							visible={isBorrowModalVisible}
							onRequestClose={() => {
								setIsBorrowModalVisible(false);
							}}
						>
							<View style={styles.modalContainer}>
								<View style={styles.modalContent}>
									<Text style={styles.modalTitle}>Veux tu emprunter ? </Text>
									<View style={styles.iconContainer}>
										<FontAwesome
											style={styles.iconX}
											name="camera"
											size={50}
											color="#198EA5"
										/>
									</View>
									<View style={styles.modalButtonContainer}>
										<TouchableOpacity
											onPress={() => {
												setIsBorrowModalVisible(false);
											}}
											style={[styles.modalButton, styles.cancelButton]}
										>
											<Text style={styles.modalButtonText}>Annuler</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={() => {
												handleBorrow(selectedItemInfo)
												setIsBorrowModalVisible(false);
											}}
											style={[styles.modalButton, styles.confirmButton]}
										>
											<Text style={styles.modalButtonText}>Oui</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</Modal>
					</View>
				</Modal>

				{/* Modal de filtre sur les communautés */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={modalFilterVisible}
					onRequestClose={() => setModalFilterVisible(false)}>

					<View style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center' }}>
						<View style={{ alignItems: 'flex-start', backgroundColor: 'white', marginVertical: Dimensions.get('screen').height / 3.75, borderRadius: 20, paddingHorizontal: 20, marginHorizontal: Dimensions.get('screen').width / 25, paddingVertical: 15 }}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', columnGap: 15 }}>
								<Text style={{ fontWeight: 'bold', fontSize: 13, width: '75%' }}>Dans quelle(s) communauté(s) voulez-vous chercher ?</Text>
								<FontAwesome name='close' size={20} style={{ backgroundColor: '#198EA5', borderRadius: 50 }} />
							</View>
							<ScrollView style={{  width: '100%' }} contentContainerStyle={{ flex: 1, justifyContent: 'center', rowGap: 25 }}>
								{
									userCommunities && userCommunities.map((commu, i) => {
										return (
											<TouchableOpacity key={i} onPress={() => filterSelectedCommu(i)} style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', columnGap: 20 }}>
												<View style={{ backgroundColor: commu.selected ? '#CE8D2C' : undefined, borderColor: '#CE8D2C', borderWidth: 1, width: 10, height: 10, borderRadius: 2 }} />
												<Text>{commu.name}</Text>
											</TouchableOpacity>
										)
									})
								}
							</ScrollView>
						</View>
					</View>
				</Modal>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,
		height: "10%",
		backgroundColor: "#198EA5",
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		color: "white",
	},
	titleh: {
		fontSize: 20,
		fontWeight: "600",
		color: "#353639",
	},
	titleh1: {
		fontSize: 20,
		fontWeight: "600",
		color: "#198EA5",
	},
	userIcon: {
		padding: 10,
	},
	contentTop: {
		width: "100%",
		height: "20%",
		backgroundColor: "#F8FCFB",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 20,
	},
	row: {
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
		width: 250,
		height: 50,
		backgroundColor: "#F8FCFB",
		borderColor: "#198EA5",
		borderWidth: 2,
		fontSize: 16,
		borderRadius: 10,
		paddingLeft: "5%",
		marginVertical: 12,
	},
	contentList: {
		width: "100%",
		height: "60%",
		backgroundColor: "#F8FCFB",
		borderTopWidth: 1,
	},
	rowMenu: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		alignItems: "center",
		width: "100%",
		height: "10%",
		backgroundColor: "#F8FCFB",
	},
	filter: {
		borderRadius: 10,
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#198EA5",
	},
	rowSearch: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		alignItems: "center",
		width: "100%",
		marginTop: 20,
	},
	iconTextContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	iconText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#198EA5",
		marginLeft: 5,
	},
	map: {
		flex: 1,
	},
	selectedTab: {
		borderBottomColor: "#198EA5",
		borderBottomWidth: 2,
	},
	selectedTabText: {
		color: "#198EA5",
	},
	listItem: {
		alignItems: "center",
		flexDirection: "column",
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		padding: 30,
	},
	listIcon: {
		marginRight: 10,
	},
	mapIcon: {
		marginRight: 10,
	},
	itemTitle: {
		fontSize: 16,
		fontWeight: "500",
		color: "#333",
		marginLeft: 10,
	},
	selectedItem: {
		backgroundColor: "#EEFCFF",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		backgroundColor: "#F8FCFB",
		padding: 70,
		borderRadius: 10,
		marginLeft: 50,
		marginRight: 50,
		marginTop: 50,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 60,
	},
	modalCloseButton: {
		marginTop: 20,
		alignSelf: "flex-end",
	},
	modalCloseButtonText: {
		color: "#198EA5",
		fontWeight: "bold",
	},
	borrowButton: {
		backgroundColor: "#198EA5",
		borderRadius: 5,
		padding: 10,
		marginTop: 10,
	},
	emprunterButton: {
		backgroundColor: "#198EA5",
		borderRadius: 10,
		padding: 10,
	},
	emprunterButtonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	iconEmprunter: {
		margin: 5,
		marginLeft: 0,
	},
	mapContainer: {
		flex: 1,
	},
	borrowTextInput: {
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 5,
		padding: 10,
		marginBottom: 10,
		height: 100,
	},
	modalButtonContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	modalButton: {
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderRadius: 5,
		marginLeft: 10,
	},
	cancelButton: {
		backgroundColor: "#ccc",
	},
	confirmButton: {
		backgroundColor: "#198EA5",
	},
	modalButtonText: {
		color: "white",
		fontWeight: "bold",
	},
	iconX: {
		textAlign: "center",
	},
	username: {
		fontWeight: "bold",
		color: "#198EA5",
	},
	dispoText: {
		color: "#353639", // Couleur du texte "Dispo !"
		fontWeight: "bold",
		marginTop: 5, // Espacement par rapport au texte principal
	},
	itemTitleObj: {
		color: "#126171",
		fontWeight: "bold",
		fontSize: 18,
	},
});
