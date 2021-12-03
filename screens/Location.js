import React, {useEffect, useState} from 'react';
import {
  Heading,
  Text,
  VStack,
  Box,
  Image,
  Center,
  NativeBaseProvider,
  AspectRatio,
  Stack,
  ScrollView,
  Button,
  FormControl,
  Modal,
  HStack,
  Input,
} from 'native-base';
import {View, StyleSheet} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useAuth} from '../providers/AuthProvider';

function Location({route, navigation}) {
  /*Get the params */
  const {fullItem} = route.params;
  const {_id, location_pic, name, description} = fullItem;
  const coordsObj = eval('(' + fullItem['coordinates'] + ')');
  const {user, signUp, signIn} = useAuth();
  const [userSavedLocation, setUserSavedLocation] = useState([]);
  const [isLocationSaved, setIsLocationSaved] = useState(false);
  const [imageUri, setImageUri] = useState();
  const [dispImageUri, setDispImageUri] = useState(fullItem.location_pic);
  const [showModal, setShowModal] = useState(false);
  // const [imageUriGallery, setImageUriGallery] = useState(null);

  /** will move fetch functions to data.js */

  /** fetch for PATCH and DELETE */
  const bookmarkEndpoint = async (inputdata, method) => {
    try {
      const response = await fetch(
        `https://ccp2-capstone-backend-sa-yxiyypij7a-an.a.run.app/api/user/${user.id}/bookmarks`,
        {
          method: method.toUpperCase(), // *GET, POST, PUT, DELETE, etc.
          // mode: 'cors', // no-cors, *cors, same-origin
          // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          // credentials: 'same-origin', // include, *same-origin, omit
          headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          // redirect: 'follow', // manual, *follow, error
          // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(inputdata), // body data type must match "Content-Type" header
        },
      );
      const data = await response.text();
      return data;
    } catch (err) {
      console.log('error', err);
    }
  };

  /** fetch for GET */
  const getBookmarkEndpoint = async () => {
    try {
      const response = await fetch(
        `https://ccp2-capstone-backend-sa-yxiyypij7a-an.a.run.app/api/user/${user.id}/bookmarks`,
        {
          method: 'GET',
        },
      );
      const data = await response.text();
      return data;
    } catch (err) {
      console.log('error', err);
    }
  };

  /** onClick function that saves location */
  const onSaveClick = () => {
    console.log('save click');
    fetchData = async () => {
      const data = await bookmarkEndpoint(fullItem, 'patch');
    };
    fetchData();
    fetchBookmarkData();
  };

  /** onClick function that deletes location */
  const onDeleteClick = () => {
    console.log('delete click');
    fetchData = async () => {
      const data = await bookmarkEndpoint(fullItem, 'delete');
    };
    fetchData();
    fetchBookmarkData();
  };

  /** async function for fetching saved locations used by onClick functions */
  async function fetchBookmarkData() {
    const data = await getBookmarkEndpoint('get');
    setUserSavedLocation(JSON.parse(data)[0].bookmarks);
  }

  /** compare saved locations if already saved */
  const checkIfLocationIsSaved = () => {
    const locationObject = userSavedLocation.find(
      location => location._id === fullItem._id,
    );
    if (locationObject !== undefined) {
      setIsLocationSaved(true);
    } else {
      setIsLocationSaved(false);
    }
  };

  /** use effect for initial load only */
  useEffect(() => {
    fetchBookmarkData();
    checkIfLocationIsSaved();
  }, []);

  /** use effect for every updated of userSavedLocation */
  useEffect(() => {
    checkIfLocationIsSaved();
  }, [userSavedLocation]);

  /** Image Picker via camera access */
  const openCamera = () => {
    const options = {
      storageOptions: {
        path: 'images',
        mediaType: 'photo',
        cameraType: 'back',
        allowsEditing: true,
        noData: true,
      },
      includeBase64: true,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const uri = response.assets[0].uri;
        setImageUri(response.assets[0].uri);
        setDispImageUri(response.assets[0].uri);
      }
    });
  };

  /** Image Picker via library access */
  const openLibrary = () => {
    const options = {
      storageOptions: {
        quality: 1,
        mediaType: 'photo',
        cameraType: 'back',
        allowsEditing: true,
        noData: true,
        maxWidth: 8000,
        maxHeight: 8000,
      },
    };

    launchImageLibrary(options, response => {
      console.log('response: ', response);
      console.log('response latitude: ', response.latitude);
      console.log('response longitude: ', response.longitude);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const uri = response.assets[0].uri;
        setImageUri(response.assets[0].uri);
        setDispImageUri(response.assets[0].uri);
      }
    });
  };

  /** POST request sending imageUri to backend */
  const postImage = imageUri => {
    // console.log('POST imageUri');
    // console.log('imageUri', imageUri);
    // console.log('user.id', user.id);
    // console.log('_id', _id);
    const url = `https://ccp2-capstone-backend-sa-yxiyypij7a-an.a.run.app/api/user/${user.id}/location/${_id}/photo`;
    let formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'image.jpg',
      type: 'image/jpeg',
    });
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    }).catch(error => {
      console.warn(error);
    });
  };

  // useEffect(() => {
  //   postImage(imageUri);
  // }, [imageUri]);

  return (
    <NativeBaseProvider>
      <Center flex={1}>
        <Box flex="1" safeAreaTop>
          <ScrollView>
            <VStack space={4} alignItems="center">
              <AspectRatio w="100%" ratio={16 / 9}>
                {location_pic === '' || location_pic === null ? (
                  <Center flex="1">
                    <Text fontWeight="400">No Image yet</Text>
                  </Center>
                ) : (
                  <Image
                    source={{
                      uri: location_pic,
                    }}
                    alt="image"
                  />
                )}
              </AspectRatio>
              <Box
                safeArea
                w="80"
                maxW="80"
                rounded="lg"
                overflow="hidden"
                borderColor="coolGray.200"
                borderWidth="1"
                p="2"
                py="8"
                _dark={{
                  borderColor: 'coolGray.600',
                  backgroundColor: 'gray.700',
                }}
                _web={{
                  shadow: 2,
                  borderWidth: 0,
                }}
                _light={{
                  backgroundColor: 'gray.50',
                }}>
                <Stack p="4" space={3}>
                  <Stack space={2}>
                    <Heading size="md" ml="-1">
                      {name}
                    </Heading>
                  </Stack>
                  <Text fontWeight="400">
                    {description === '' || description === null
                      ? 'No description yet.'
                      : description}
                  </Text>
                  <Box
                    flex={1}
                    justifyContent="flex-end"
                    rounded="lg"
                    overflow="hidden"
                    alignItems="center"
                    justifyContent="center">
                    <AspectRatio w="100%" ratio={16 / 9}>
                      <MapView
                        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        style={mapStyles.map}
                        region={{
                          latitude: parseFloat(coordsObj['latitude']),
                          longitude: parseFloat(coordsObj['longitude']),
                          latitudeDelta: 0.015,
                          longitudeDelta: 0.0121,
                        }}>
                        <Marker
                          key={0}
                          coordinate={{
                            latitude: parseFloat(coordsObj['latitude']),
                            longitude: parseFloat(coordsObj['longitude']),
                          }}
                          // title={marker.title}
                          // description={marker.description}
                        />
                      </MapView>
                    </AspectRatio>
                  </Box>
                  {isLocationSaved ? (
                    <Button
                      colorScheme="blue"
                      size="md"
                      onPress={onDeleteClick}>
                      Remove Location
                    </Button>
                  ) : (
                    <Button colorScheme="blue" size="md" onPress={onSaveClick}>
                      Save Location
                    </Button>
                  )}
                  <Button colorScheme="blue" onPress={() => setShowModal(true)}>
                    Add Post
                  </Button>
                  <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                    <Modal.Content size="sm">
                      <Modal.CloseButton />
                      <Modal.Header>New Post</Modal.Header>
                      <Modal.Body>
                        <HStack space={5} alignItems="center">
                          <Image
                            border={1}
                            borderWidth={5}
                            borderColor="white"
                            source={{
                              uri: dispImageUri,
                            }}
                            alt="Alternate Text"
                            size="xl"
                          />
                          <VStack space={5}>
                            <Button
                              colorScheme="blue"
                              size="md"
                              onPress={() => {
                                openCamera();
                              }}>
                              Take Photo
                            </Button>
                            <Button
                              colorScheme="blue"
                              size="md"
                              onPress={() => {
                                openLibrary();
                              }}>
                              Choose From Library
                            </Button>
                          </VStack>
                        </HStack>
                        <Input
                          height="30%"
                          placeholder="Add a caption..."
                          mt="2"
                          paddingLeft="3"
                          rounded="lg"
                          borderWidth="5"
                          style={{borderColor: '#3b81f6', fontSize: 15}}
                        />
                      </Modal.Body>
                      <Modal.Footer>
                        <Button.Group space={2}>
                          <Button
                            variant="ghost"
                            colorScheme="blueGray"
                            onPress={() => {
                              setShowModal(false);
                            }}>
                            Cancel
                          </Button>
                          <Button
                            colorScheme="blue"
                            onPress={() => {
                              setShowModal(false), postImage(imageUri);
                            }}>
                            Post
                          </Button>
                        </Button.Group>
                      </Modal.Footer>
                    </Modal.Content>
                  </Modal>
                </Stack>
              </Box>
            </VStack>
          </ScrollView>
        </Box>
      </Center>
    </NativeBaseProvider>
  );
}

const mapStyles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
});

export default Location;
