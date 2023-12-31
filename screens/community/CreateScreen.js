import React, { useState } from 'react';
import { Linking } from 'react-native';
import { useSelector } from "react-redux";
import { StyleSheet, Text, View, TouchableOpacity, Platform, SafeAreaView, StatusBar, KeyboardAvoidingView, TextInput, Modal } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { BACKEND_URL } from '../../Constants';
import Global, { Colors, iconPadding, ttkFont } from "../../styles/Global";
import { useDispatch } from 'react-redux';
import { logout } from '../../reducers/users';

export default function CreateScreen({ navigation }) {

  const dispatch = useDispatch();

  //mémo : récupérer/traduire la localisation de l'input "Localisation"
    // On recupère le token
    const token = useSelector((state) => state.users.token);
   


  const [isModalVisible, setModalVisible] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [communityLocalisation, setCommunityLocalisation] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPrivateOrPublicUndefined, setIsPrivateOrPublicUndefiened] = useState(null);
  const [isPublic, setIsPublic] = useState(null);
  const [isModalLogoutVisible, setModalLogoutVisible] = useState(false);


  const [accessCode, setAccessCode] = useState("");

  const openModal = (name, code) => {
    setModalVisible(true);
    setCommunityName(name);
    setAccessCode(code);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetCommunityName();
    resetPrivatePublicButtons(); // Réinitialise les boutons Private et Public
  };

  const resetCommunityName = () => {
    setCommunityName('');
  };

  const handlePrivateButtonPress = () => {
    setIsPrivate(true);
    setIsPublic(false);
    setIsPrivateOrPublicUndefiened(false); // Reset error message when a selection is made
  };

  const handlePublicButtonPress = () => {
    setIsPrivate(false);
    setIsPublic(true);
    setIsPrivateOrPublicUndefiened(false); // Reset error message when a selection is made
  };

  const resetPrivatePublicButtons = () => {
    setIsPrivate(false);
    setIsPublic(false);
  };

  //const privateOrPublic = isPrivate || isPublic ;

  // fetch route create
  const createCommunity = async () => {
    if (isPrivate || isPublic) {
    try {
      const response = await fetch(`${BACKEND_URL}/communities/create/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: communityName.trim(),
          localisation: communityLocalisation,
          description: communityDescription,
          photo: 'Your community photo URL',
          isPrivate: isPrivate, 
        }),
      });

      const data = await response.json();

      if (data.result) {
        console.log('La commu est créée!');
        console.log(data);
        openModal(communityName, data.accessCode);
      } else {
        console.log('Error1 :', data.error);
      }
    } catch (error) {
      console.log('Error 2:', error.message);
    }
  } else {
    setIsPrivateOrPublicUndefiened(true); // Show error message when no selection is made
    setIsPublic(false);
    setIsPrivate(false);
  }
}

const openModalLogout = () => {
  setModalLogoutVisible(true)
  }
  
  const closeModalLogout = () => {
  setModalLogoutVisible(false)
  }

     //fonction logout
     const handleLogout = () => {
      dispatch(logout());
    
      navigation.navigate('SignIn');
    };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ rowGap: 25 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Text style={styles.title}>TOUTENKOMMUN</Text>
          <FontAwesome style={styles.userIcon} name="power-off" onPress={openModalLogout} />
        </View>

        <View style={styles.upperText}>
          <Text style={styles.h5}>Créer ma communauté</Text>
        </View>
        <View style={{ rowGap: 30, alignItems: 'center' }}>
          <View style={Global.inputWithIcon}>
          <FontAwesome style={{ padding:iconPadding }} name='users' size={20} color='#353639' />
            <TextInput
              style={[{ width: '85%' }, Global.input]}
              placeholder="Nom communauté"
              placeholderTextColor='#353639'
              autoCapitalize='none'
              value={communityName}
              onChangeText={(text) => setCommunityName(text)}/>
          </View>
       
        </View>
        <View style={{ rowGap: 30, alignItems: 'center' }}>
          <View style={Global.inputWithIcon}>
          <FontAwesome style={{ padding:iconPadding }} name='quote-left' size={20} color='#353639' />
            <TextInput
              style={[{ width: '85%' }, Global.input]}
              placeholder="Description"
              placeholderTextColor='#353639'
              autoCapitalize='none'
              value={communityDescription}
              onChangeText={(text) => setCommunityDescription(text)}/>
          </View>
       
        </View>
        <View style={{ alignItems: 'center' }}>
          <View style={Global.inputWithIcon}>
          <FontAwesome style={{ padding:iconPadding }} name='map-pin' size={20} color='#353639' />
            <TextInput
              style={[{ width: '85%' }, Global.input]}
              placeholder="Localisation "
              placeholderTextColor='#353639'
              autoCapitalize='none'
              value={communityLocalisation}
              onChangeText={(text) => setCommunityLocalisation(text)}/>
          </View>
       
        </View>
        <View style={styles.btnConnect}>
          <TouchableOpacity
            style={[styles.btnPrive, isPrivate ? styles.btnActive : null]}
            activeOpacity={0.8}
            onPress={handlePrivateButtonPress}
          >
            <FontAwesome style={styles.ppIcon} name='lock' size={20} color={isPrivate ? '#F8FCFB' : '#198EA5'} />
            <Text style={[ styles.textBtnPrive, isPrivate ? styles.textActive : null]}>Privé</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnPublic, isPublic ? styles.btnActive : null]}
            activeOpacity={0.8}
            onPress={handlePublicButtonPress}
          >
            <FontAwesome5 style={styles.ppIcon} name='door-open' size={20} color={isPublic ? '#F8FCFB' : '#198EA5'} />
            <Text style={[styles.textBtnPublic, isPublic ? styles.textActive : null]}>Public</Text>
          </TouchableOpacity>
        </View>
        <View>
        {isPrivateOrPublicUndefined && <Text style={styles.error}>Choisir "Public" ou "Privé"</Text>}
        </View>
        <View style={styles.btnCreateContent}>
          <TouchableOpacity style={[Global.filledButtonWithIcon, { marginTop: 30 }]} onPress={createCommunity}>
            <FontAwesome style={styles.ppIcon} name='user-plus' size={20} color='#F8FCFB' />
            <Text style={Global.textBtnWithIcon}>
                  Créer
                </Text>
          </TouchableOpacity>
        </View>
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <Text style={Global.h5}>
  Bravo, votre communauté <Text style={Global.h5}>"{communityName}"</Text> est prête ! Maintenant, invitez vos amis à vous rejoindre avec ce code :{' '}
  <Text style={{ fontWeight: 'bold' }}>{accessCode}</Text>
</Text>
              <View style={Global.buttonsContainers}>
                <TouchableOpacity style={[Global.btnRes, { backgroundColor: '#198EA5' }]} activeOpacity={0.8} onPress={() => closeModal()}>
                  <FontAwesome style={styles.ppIcon} name='envelope-o' size={20} color='#F8FCFB' />
                  <Text style={styles.emailButtonText}>E-mail</Text>
                </TouchableOpacity>
                    <TouchableOpacity
                     style={[Global.btnRes, { backgroundColor: '#198EA5' }]} activeOpacity={0.8}
                      onPress={() => {
                        const smsBody = encodeURIComponent(`Rejoignez ma communauté ${communityName} avec le code : ${accessCode}`);
                        Linking.openURL(`sms:&body=${smsBody}`);
                      }}
                    >
                  <FontAwesome style={styles.ppIcon} name='commenting' size={20} color='#F8FCFB' />
                  <Text style={styles.smsButtonText}>SMS</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => {
                closeModal(); 
                navigation.navigate('TabNavigator', { screen: 'Prêt' })
              }}>
                <Text style={styles.closeText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*MODAL LOGOUT*/}
        <Modal
                      visible={isModalLogoutVisible}
                      animationType="slide"
                      transparent={true}
                    >
                      <TouchableOpacity
                        activeOpacity={1}
                        onPressOut={closeModalLogout} // Ferme la modal lorsque vous cliquez en dehors d'elle
                        style={styles.modalContainer}
                      >
                        <TouchableOpacity activeOpacity={1} style={styles.modalLogoutContent}>
                          {/* Contenu de la modal */}
                          <View style={styles.modalBtnContent}>
                            {/* Bouton pour supprimer la communauté */}
                            <TouchableOpacity
                              style={styles.deconnecterButton}
                              onPress={handleLogout}
                            >
                              <FontAwesome
                                style={styles.ppIcon}
                                name="sign-out"
                                size={20}
                                color="#F8FCFB"
                              />
                              <Text style={styles.smsButtonText}>Se déconnecter</Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </Modal>

        <StatusBar style="auto" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCFB',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#198EA5",
    height: "10%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  userIcon: {
    margin: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  upperText: {
    height: '14%',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: "green"
  },
  h5: {
    fontSize: 20,
    color: '#353639',
  },
  inputContent: {
    height: '16%',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'yellow'
  },
  inputCommuContent: {
    flexDirection: 'row',
    height: '45%',
    width: '87%',
    borderWidth: 2,
    borderColor: '#198EA5',
    borderRadius: 10,
    paddingLeft: '5%',
    alignItems: 'center',
  },
  inputCommuContent2: {
    flexDirection: 'row',
    height: '60%',
    width: '87%',
    borderWidth: 2,
    borderColor: '#198EA5',
    borderRadius: 10,
    paddingLeft: '5%',
    alignItems: 'center',
  },
  commuIcon: {
    padding: 10,
  },
  nameCommuText:{
    marginTop: '2%',
    marginRight: '43%',
  },
  nameCommuText2:{
    marginTop: '2%',
    marginRight: '37%',
  },
  nameCommuText3:{
    marginTop: '2%',
    marginRight: '67%',
  },
  btnConnect: {
    height: '12%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // backgroundColor: 'red'

  },
  btnPrive: {
    flexDirection: 'row',
    height: '40%',
    width: '40%',
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
    fontSize: 20,
  },
  btnPublic: {
    flexDirection: 'row',
    height: '40%',
    width: '40%',
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
    fontSize: 20,
  },
  textBtnPrive: {
    color: '#198EA5',
    fontSize: 20,
    fontFamily: ttkFont

  },
  textBtnPublic: {
    color: '#198EA5',
    fontSize: 20,
    fontFamily: ttkFont,
  },
  ppIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  btnCreateContent: {
    height: '20%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: '5%',
  },
  btnCreate: {
    flexDirection: 'row',
    height: '40%',
    width: '87%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#198EA5',
    borderRadius: 10,
  },
  btnTextCreate: {
    color: '#F8FCFB',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#F8FCFB',
    padding: 20,
    borderRadius: 10,
    marginLeft: 25,
    marginRight: 25,
  },
  closeText: {
    color: '#198EA5',
    marginTop: 10,
    textAlign: 'center',
  },
  modalBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
    backgroundColor: '#198EA5',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  emailButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  smsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
    backgroundColor: '#198EA5',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  smsButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  btnActive: {
    backgroundColor: '#198EA5',
    borderWidth: 0,
  },
  textActive: {
    color: '#F8FCFB',
  },
  error: {
    color: 'red',
    textAlign: 'center'
  },
  deconnecterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
    backgroundColor: "#198EA5",
    padding: 10,
    borderRadius: 5,
  },
  modalLogoutContent: {
    backgroundColor: "#F8FCFB",
    padding: 20,
    borderRadius: 10,
    marginLeft: 25,
    marginRight: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
