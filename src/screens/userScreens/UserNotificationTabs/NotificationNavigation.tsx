import {getPost} from '../../../lib/api/post.lib';
import {findAUser} from '../../../lib/api/user.lib';
import {listCrusForUser} from '../../../lib/api/cru.lib';
import {navigate} from '../../../util/RootNavigation';

export function navigateToScreen(screenname: string, params?: object) {
    navigate('NoBottomStack', {screen: screenname, params: params});
}

export const NotificationNavigation = async (notification: any, userID: any) => {
    console.log('NotificationNavigation called: ', notification);

    try {
        let postId;
        let userId;
        let currentUser;
        switch (notification.type) {
            case 'MITReceived':
                navigateToScreen('UserMITHubScreen', {index: 0});
                break;
            case 'MITAccepted':
                navigateToScreen('UserProfileScreen', {index: 1});
                break;
            case 'MITDeclined':
                navigateToScreen('UserMITHubScreen', {index: 1});
                break;
            case 'MITCanceled':
                navigateToScreen('UserProfileScreen', {index: 1});
                break;
            case 'CruViewStarted':
                navigateToScreen('UserProfileScreen', {index: 1});
                break;
            case 'CRUViewCanceled':
                navigateToScreen('UserProfileScreen', {index: 1});
                break;
            case 'UserLikedGallery':
                const galleryId = notification.galleryId;
                await findAUser({id: userID}).then(user => {
                    currentUser = user;
                });
                const galleryItem = currentUser.userGallery.find(item => item.id === galleryId);
                navigateToScreen('ViewUserScreen', {userID: userID, imageURL: galleryItem.imageURL});
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
                navigateToScreen('UserProfileScreen', {index: 2});
                break;
            case 'CruInviteAccepted':
                navigateToScreen('UserProfileScreen', {index: 0});
                break;
            case 'CruInviteDeclined':
                navigateToScreen('UserProfileScreen', {index: 0});
                break;
            case 'CruViewScheduled':
                navigateToScreen('UserProfileScreen', {index: 1});
                break;
            case 'ADReceived':
                navigateToScreen('UserProfileScreen', {index: 3});
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
