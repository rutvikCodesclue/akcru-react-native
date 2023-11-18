import {View} from 'react-native';
import React, {useState} from 'react';
import {Avatar, Icon} from '@rneui/base';
import {selectAvatarBorderColor} from '../../util/util';
import imageindex from '../../../assets/images/imageindex';



type CruMemberPicProps = {
    userPicture: string | undefined;
    akcruBadge: any;
};

const CruMemberPic = ({userPicture, akcruBadge}: CruMemberPicProps) => {
    return (
        
            <Avatar
                rounded
                size={40}
                source={
                    userPicture
                        ? {
                              uri: userPicture,
                          }
                        : imageindex.Akcruplaceholder
                }
                avatarStyle={{
                    borderWidth: 2,
                    borderColor: selectAvatarBorderColor(akcruBadge),
                }}
            />
       
    );
};

export default CruMemberPic;
