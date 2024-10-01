import {getPost} from '../../../lib/api/post.lib';
import {findAUser} from '../../../lib/api/user.lib';
import {listCrusForUser} from '../../../lib/api/cru.lib';
import {navigate} from '../../../util/RootNavigation';

export function navigateToScreen(screenname: string, params?: object) {
    if (screenname === 'UserProfileScreen') {
        navigate('UserProfileStack', {screen: 'UserProfileScreen', params: params});
    } else {
        navigate('NoBottomStack', {screen: screenname, params: params});
    }
}

export const NotificationNavigation = async (notification: any, userID: any) => {
    try {
        let postId;
        let userId;
        let currentUser;
        switch (notification.type) {
            case 'MITReceived':
                navigateToScreen('UserMITHubScreen', {index: 0});
                break;
            case 'MITAccepted':
                navigateToScreen('UserProfileScreen', {tabKey: 'second'});
                break;
            case 'MITDeclined':
                navigateToScreen('UserMITHubScreen', {index: 1});
                break;
            case 'MITCanceled':
                navigateToScreen('UserProfileScreen', {tabKey: 'second'});
                break;
            case 'CruViewStarted':
                navigateToScreen('UserProfileScreen', {tabKey: 'second'});
                break;
            case 'CRUViewCanceled':
                navigateToScreen('UserProfileScreen', {tabKey: 'second'});
                break;
            case 'UserLikedGallery':
                userId = notification.senderId;
                try {
                    const galleryId = notification.galleryId;
                    await findAUser({id: userID}).then(user => {
                        currentUser = user;
                    });
                    const galleryItem = currentUser.userGallery.find(item => item.id === galleryId);
                    if (galleryItem) {
                        navigateToScreen('ViewUserScreen', {userID: userID, imageURL: galleryItem.imageURL});
                    } else {
                        console.error('Gallery item not found for the provided galleryId:', galleryId);
                    }
                } catch (error) {
                    console.error('Error in handling UserLikedGallery notification:', error);
                }
                break;

            case 'UserLikedComment':
                postId = notification.postId;
                if (postId) {
                    const numericPostId = parseInt(postId, 10);
                    const post = await getPost(numericPostId);
                    if (post) {
                        navigateToScreen('PostScreen', {post: post});
                    } else {
                        console.error('Post not found');
                    }
                }
                break;
            case 'UserLikedPost':
                postId = notification.postId;
                if (postId) {
                    const numericPostId = parseInt(postId, 10);
                    const post = await getPost(numericPostId);
                    if (post) {
                        navigateToScreen('PostScreen', {post: post});
                    } else {
                        console.error('Post not found');
                    }
                }
                break;
            case 'UserTaggedOnPost':
                postId = notification.postId;
                if (postId) {
                    const numericPostId = parseInt(postId, 10);
                    const post = await getPost(numericPostId);
                    if (post) {
                        navigateToScreen('PostScreen', {post: post});
                    } else {
                        console.error('Post not found');
                    }
                }
                break;
            case 'UserCommentedOnPost':
                postId = notification.postId;
                if (postId) {
                    const numericPostId = parseInt(postId, 10);
                    const post = await getPost(numericPostId);
                    if (post) {
                        navigateToScreen('PostScreen', {post: post});
                    } else {
                        console.error('Post not found');
                    }
                }
                break;
            case 'UserTaggedOnComment':
                postId = notification.postId;
                if (postId) {
                    const numericPostId = parseInt(postId, 10);
                    const post = await getPost(numericPostId);
                    if (post) {
                        navigateToScreen('PostScreen', {post: post});
                    } else {
                        console.error('Post not found');
                    }
                }
                break;
            case 'UserFollowed':
                userId = notification.senderId;
                if (userId) {
                    navigateToScreen('ViewUserScreen', {userID: userId});
                } else {
                    console.error('User ID not found');
                }
                break;
            case 'CruInviteReceived':
                navigateToScreen('UserProfileScreen', {tabKey: 'third'});
                break;
            case 'CruInviteAccepted':
                navigateToScreen('UserProfileScreen', {tabKey: 'first'});
                break;
            case 'CruInviteDeclined':
                navigateToScreen('UserProfileScreen', {tabKey: 'first'});
                break;
            case 'CruViewScheduled':
                navigateToScreen('UserProfileScreen', {tabKey: 'second'});
                break;
            case 'ADReceived':
                navigateToScreen('UserProfileScreen', {tabKey: 'fourth'});
                break;
            case 'GroupMessageReceived':
                let userCrus = await listCrusForUser(userID);
                let targetCruId = notification.cruId;
                let targetCru = userCrus.find(item => item.id === targetCruId);
                navigateToScreen('ViewGroupChat', {cru: targetCru});
                break;
            case 'MsgRcvd':
                let senderId = notification.senderId;
                let mITId = notification.mITId;
                await findAUser({id: senderId}).then(user => {
                    currentUser = user;
                });
                let senderProfilePicture = currentUser.profilePicture;
                let senderUsername = currentUser.username;
                navigateToScreen('ViewChat', {
                    mItInviteId: mITId,
                    userId: senderId,
                    profilePicture: senderProfilePicture,
                    username: senderUsername,
                });
                break;
            default:
                console.warn('Unhandled notification type:', notification.type);
                break;
        }
    } catch (error) {
        console.error('Error navigating to content:', error);
    }
};
