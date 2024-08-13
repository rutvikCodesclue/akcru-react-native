import {getPost} from '../../../lib/api/post.lib';
import {findAUser} from '../../../lib/api/user.lib';
import {listCrusForUser} from '../../../lib/api/cru.lib';
import {navigate} from '../../../util/RootNavigation';



export const NotificationNavigation = async (notification: any, userID: any) => {
    try {
        let postId, userId, currentUser, screename, params;
        switch (notification.type) {
            case 'MITReceived':
                screename = 'UserMITHubScreen'
                params= {index: 0};
                break;
            case 'MITAccepted':
                screename = 'UserProfileScreen'
                params= {index: 1};
                break;
            case 'MITDeclined':
                screename = 'UserMITHubScreen'
                params= {index: 1};
                break;
            case 'MITCanceled':
                screename = 'UserProfileScreen'
                params= {index: 1};
                break;
            case 'CruViewStarted':
                screename = 'UserProfileScreen'
                params= {index: 1};
                break;
            case 'CRUViewCanceled':
                screename = 'UserProfileScreen'
                params= {index: 1};
                break;
            case 'UserLikedGallery':
                const galleryId = notification.galleryId;
                await findAUser({id: userID}).then(user => {
                    currentUser = user;
                });
                const galleryItem = currentUser.userGallery.find(item => item.id === galleryId);
                screenname = 'ViewUserScreen';
                params = {userID: userID, imageURL: galleryItem.imageURL}
                break;
            case 'UserLikedComment':
                postId = notification.postId;
                if (postId) {
                    const numericPostId = parseInt(postId, 10);
                    const post = await getPost(numericPostId);
                    if (post) {
                        screenname = 'PostScreen';
                        params = {post: post}
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
                        screenname = 'PostScreen';
                        params = {post: post}

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
                        screenname = 'PostScreen';
                        params = {post: post}
                        
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
                        screenname = 'PostScreen';
                        params = {post: post}
                        
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
                        screename = 'PostScreen';
                        params = {post: post}
                    } else {
                        console.error('Post not found');
                    }
                }
                break;
            case 'UserFollowed':
                userId = notification.senderId;
                if (userId) {
                    screename = 'ViewUserScreen'
                    params = {userID: userId}
                    
                    
                } else {
                    console.error('User ID not found');
                }
                break;
            case 'CruInviteReceived':
                screename = 'UserProfileScreen';
                params = {index: 2}
                break;
            case 'CruInviteAccepted':
                screename = 'UserProfileScreen';
                params = {index: 0}
                break;
            case 'CruInviteDeclined':
                screename = 'UserProfileScreen';
                params = {index: 0}
                break;
            case 'CruViewScheduled':
                screename = 'UserProfileScreen';
                params = {index: 1}
                break;
            case 'ADReceived':
                screename = 'UserProfileScreen';
                params = {index: 3}
                break;
            case 'GroupMessageReceived':
                let userCrus = await listCrusForUser(userID);
                let targetCruId = notification.cruId;
                let targetCru = userCrus.find(item => item.id === targetCruId);
                screename = 'ViewGroupChat'
                params = {cru: targetCru}
                break;
            case 'MsgRcvd':
                let senderId = notification.senderId;
                let mITId = notification.mITId;
                await findAUser({id: senderId}).then(user => {
                    currentUser = user;
                });
                let senderProfilePicture = currentUser.profilePicture;
                let senderUsername = currentUser.username;
                screename = 'ViewChat'
                params  = {
                    mItInviteId: mITId,
                    userId: senderId,
                    profilePicture: senderProfilePicture,
                    username: senderUsername,
                }
                
                break;
            default:
                console.warn('Unhandled notification type:', notification.type);
                break;
        }
        return {screenName: screename, params: params}

    } catch (error) {
        console.error('Error navigating to content:', error);
    }
};
