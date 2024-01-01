import {View} from 'react-native';
import React, {useState} from 'react';
import {Avatar, Icon} from '@rneui/base';
import {selectAvatarBorderColor} from '../../util/util';
import imageindex from '../../../assets/images/imageindex';
import HexAvatar from '../HexAvatar';



type CruMemberPicProps = {
    userPicture: string | undefined;
    akcruBadge: any;
};

const CruMemberPic = ({userPicture, akcruBadge}: CruMemberPicProps) => {
    return (
        <HexAvatar
            source={
                userPicture
                    ? {
                          uri: userPicture,
                      }
                    : imageindex.Akcruplaceholder
            }
            size={45}
            bordercolor={selectAvatarBorderColor(akcruBadge)}
        />
    );
};

export default CruMemberPic;
