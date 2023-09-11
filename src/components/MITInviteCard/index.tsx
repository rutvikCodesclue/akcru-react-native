import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Avatar } from '@rneui/base';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import { set } from 'lodash';
import { acceptAMITInvite, declineAMITInvite } from '../../lib/api/mit.lib';
import { IMovie, IUserProfile } from '../../../types';


type MITInviteCardProp = {
    MITInviteID: any;
    movie: IMovie;
    creator: IUserProfile;
    inviteDate: string;
}


const MITInviteCard = ({
    MITInviteID,
    movie,
    creator,
    inviteDate,

}: MITInviteCardProp) => {

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const _acceptInvite = () => {
    setIsLoading(true);
    console.log("accept invite");
    
    acceptAMITInvite({inviteId: MITInviteID}).then((res) => {
      console.log("accepted res:", res);
      setIsLoading(false);
    });
  };
  
  const _declineInvite = () => {
    setIsLoading(true);
    console.log("decline invite");
    declineAMITInvite({inviteId: MITInviteID}).then((res) => {
      console.log("declined res:", res);
      setIsLoading(false);
    });
  };

  return (
      <View
          style={{
              backgroundColor: '#1C202A',
              borderRadius: 5,
          }}>
          <LinearGradient
              // Background Linear Gradient
              colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
              style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: 5,
              }}
          />
          <View style={{padding: 10}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{marginRight: 10}}>
                  <Avatar
                      source={{
                          uri: creator.profilePicture ?? undefined,
                      }}
                      size={50}
                      rounded
                      avatarStyle={{
                          borderWidth: 2,
                          borderColor: COLORS.AKCRUBLUE,
                      }}
                  />
              </View>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', width: 280}}>
                  <View>
                      <Text style={styles.paragraphText2}>{` ${creator.username}`}</Text>
                  </View>

                  <Text style={styles.paragraphText}>
                      has sent you a MIT Invite for <Text style={styles.paragraphText3}>"{movie.title}"</Text> on
                      <Text style={styles.paragraphText3}>
                          {' '}
                          {new Date(inviteDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                          })}
                      </Text>
                  </Text>
              </View>
          </View>
         
              <View style={{flexDirection: 'row', marginTop: 5, justifyContent: 'center'}}>
                  {/* ACCEPT BUTTON */}
                  <TouchableOpacity onPress={_acceptInvite} disabled={isLoading}>
                      <View
                          style={{
                              width: 125,
                              height: 30,
                              backgroundColor: COLORS.AKCRUBLUE,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 3,
                              marginRight: 10,
                          }}>
                          <Text style={{...FONTS.Title2}}>ACCEPT</Text>
                      </View>
                  </TouchableOpacity>
                  {/* DECLINE BUTTON */}
                  <TouchableOpacity onPress={_declineInvite} disabled={isLoading}>
                      <View
                          style={{
                              width: 125,
                              height: 30,
                              backgroundColor: COLORS.CATPURPDRK,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 3,
                          }}>
                          <Text style={styles.declineButton}>DECLINE</Text>
                      </View>
                  </TouchableOpacity>
              </View>
          </View>
          
          
      </View>
  );
}

export default MITInviteCard
