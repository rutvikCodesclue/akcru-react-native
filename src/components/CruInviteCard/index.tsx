import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Avatar } from '@rneui/base';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import { set } from 'lodash';
import { acceptACRUInvite, declineACRUInvite } from '../../lib/api/cru.lib';
import imageindex from '../../../assets/images/imageindex';
import { IUserProfile } from '../../../types';
import { selectAvatarBorderColor } from '../../util/util';
import {useNavigation} from '@react-navigation/native';
import { ClientStackParams } from '../../navigation/ClientStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HexAvatar from '../HexAvatar';
import AkcruButtons from '../akcruButtons';

type CruInviteCardProp = {
    cruInviteID: any;
    inviteeName: string;
    inviteePicture?: string | undefined;
    inviteDate: string;
    invitee: IUserProfile;
    onPress: () => void;
    decline: any;
    accept: any;
};


const CruInviteCard = ({
    cruInviteID,
    inviteeName,
    inviteePicture,
    inviteDate,
    invitee,
    onPress,
    decline,
    accept,

}: CruInviteCardProp) => {

  const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

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
          <View style={{padding: 15}}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                  <View style={{marginRight: 10}}>
                      <TouchableOpacity onPress={onPress}>
                          <HexAvatar
                              source={{uri: invitee.profilePicture}}
                              size={55}
                              bordercolor={selectAvatarBorderColor(invitee?.badge ?? 'AKCRUIT')}
                          />
                      </TouchableOpacity>
                  </View>
                  <View>
                      <View style={{flexDirection: 'row', flexWrap: 'wrap', width: 280}}>
                          <View>
                              <Text style={styles.paragraphText2}>{inviteeName}</Text>
                          </View>

                          <Text style={styles.paragraphText}>has sent you a CRU Invite on</Text>
                          <View>
                              {/* display inviteDate datetimestring as month/day/year */}
                              <Text style={styles.paragraphText3}>
                                  {new Date(inviteDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'numeric',
                                      day: 'numeric',
                                  })}
                              </Text>
                          </View>
                      </View>
                  </View>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                  <AkcruButtons.SmallButton
                      btnname="ACCEPT"
                      color={COLORS.AKCRUBLUE}
                      disabled={isLoading}
                      onPress={accept}
                  />
                  <AkcruButtons.SmallButton
                      btnname="DECLINE"
                      color={COLORS.PURPLE}
                      disabled={isLoading}
                      onPress={decline}
                  />
              </View>
          </View>
      </View>
  );
}

export default CruInviteCard
