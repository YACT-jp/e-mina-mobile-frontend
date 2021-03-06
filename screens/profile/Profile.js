import React, {useState, useEffect, useCallback} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import theme from '../../theme';
import {
  NativeBaseProvider,
  Center,
  Stack,
  Heading,
  Button,
  Image,
  Box,
  Modal,
  HStack,
  Pressable,
  Text,
} from 'native-base';
import {useFocusEffect} from '@react-navigation/core';
import {useAuth} from '../../providers/AuthProvider';
import {photosByUser, getProfile} from '../../data/data';
import {retrieveUserSession} from '../../data/secureStorage';
import ProfileGalleryNav from './ProfileGalleryNav';

function ProfileScreen({navigation}) {
  //Find additional functions on the user object
  //console.log(Object.getOwnPropertyNames(user).forEach( (props) => console.log(props)));

  const {user} = useAuth();
  const userInfo = JSON.parse(user._customData);
  //console.log(user.identities);

  // TODO LATER: Remove this useEffect and testUserToken once functionality is confirmed
  useEffect(() => {
    testUserToken();
  }, []);

  const testUserToken = async () => {
    const userData = await retrieveUserSession();
    console.log('SECURE STORAGE:', userData);
    const nowTime = new Date();
    if (!userData) console.log('ERROR-No userData');
    if (!userData['timestamp']) console.log('ERROR-No timestamp in userData');
    if (userData && userData['timestamp']) {
      const thenTime = new Date(userData['timestamp']);
      const maxDiff = 86400000 * 0.5; //Days in milliseconds * number of days to refresh token
      if (nowTime.getTime() - thenTime.getTime() > maxDiff) {
        console.log('====== NEED TO REFRESH TOKEN AFTER HALF DAY ======');
      }
    }
  };
  const {username, email, bio} = userInfo;

  const [DATA, setDATA] = useState([]);
  const [profileData, setProfileData] = useState({username, email, bio});
  const [showModal, setShowModal] = useState(false);
  const [singlePhoto, setSinglePhoto] = useState(); // passes only URL
  const [currentIndex, setCurrentIndex] = useState();
  const [refresh, setRefresh] = useState(false);
  const [initialDeleteId, setInitialDeleteId] = useState();

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        const data = await photosByUser(user.id);
        setDATA(data);
        const profData = await getProfile(user.id);
        setProfileData(profData[0]);
      }
      fetchData();
      return () => {
        console.log('unmount my profile');
      };
    }, [refresh]),
  );

  /** update photo url for singlePhoto modal */
  const handleClick = (event, url, item) => {
    setShowModal(true);
    setSinglePhoto(url);
    setCurrentIndex(DATA.indexOf(item));
    setInitialDeleteId(item.id);
    event.preventDefault();
  };

  //Process each item of the data array
  const renderItem = ({item}) => <Item url={item.url} item={item} />;

  // Header element for the scrolling Flatlist
  const _renderHeader = () => (
        <Stack p="8" space={3}>
          <Stack space={2}>
            <Heading>
              {profileData.username === null ||
              profileData.username === undefined
                ? username
                : profileData.username}
            </Heading>
          </Stack>
          <Text>
            {profileData.bio === null || profileData.bio === undefined
              ? bio
              : profileData.bio}
          </Text>
          <Box
            flex={1}
            justifyContent="flex-end"
            rounded="lg"
            overflow="hidden"
            alignItems="center"
            justifyContent="center"></Box>
          <HStack>
            <Button
              w="100%"
              size="md"
              onPress={() => {
                navigation.navigate('Edit Profile', profileData);
              }}>
              Edit Profile
            </Button>
          </HStack>
        </Stack>
  );

  //List Item Component
  const Item = ({url, item}) => (
    <Pressable
      onPress={event => handleClick(event, url, item)}
      maxWidth="25%"
      height="100">
      <Image
        source={{
          uri: url,
        }}
        alt="Alternate Text"
        maxHeight="100%"
        minWidth="100%"
        objectFit="contain"
        align="bottom"
        height="200"
      />
    </Pressable>
  );

  return (
    <NativeBaseProvider theme={theme}>
      <Center flex={1}>
        <FlatList
          ListHeaderComponent={() => _renderHeader()}
          numColumns={4}
          key={4}
          data={DATA}
          renderItem={renderItem}
          style={{paddingHorizontal: 4, width: '100%'}}></FlatList>
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <ProfileGalleryNav
            DATA={DATA}
            showModalInit={showModal}
            singlePhoto={singlePhoto}
            currentIndex={currentIndex}
            setShowModal={setShowModal}
            refresh={refresh}
            setRefresh={setRefresh}
            initialDeleteId={initialDeleteId}
          />
        </Modal>
      </Center>
    </NativeBaseProvider>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
