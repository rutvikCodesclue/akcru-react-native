import {HMSPeer, HMSTrack, HMSTrackSource, HMSTrackType} from '@100mslive/react-native-hms';
import {MemberInfo, PeerTrackNode} from './WatchPartyProps';
import {findAUser} from '../../../lib/api/user.lib';
import {Dispatch, SetStateAction} from 'react';
import {getCruViewHostId} from '../../../lib/api/cru.lib';
import {getMITHostId} from '../../../lib/api/mit.lib';

const getPeerTrackNodeId = (peer: HMSPeer, track: HMSTrack | undefined) => {
    return peer.peerID + (track?.source ?? HMSTrackSource.REGULAR);
};

const createPeerTrackNode = (peer: HMSPeer, track?: HMSTrack | undefined): PeerTrackNode => {
    let isVideoTrack = false;
    if (track && track?.type === HMSTrackType.VIDEO) {
        isVideoTrack = true;
    }
    const videoTrack = isVideoTrack ? track : undefined;
    return {
        id: getPeerTrackNodeId(peer, track),
        peer: peer,
        track: videoTrack,
    };
};

export const removeNodeWithPeerId = (nodes: PeerTrackNode[], peerID: string) => {
    return nodes.filter(node => node.peer.peerID !== peerID);
};

export const _updateNode = (data: {
    nodes: PeerTrackNode[];
    peer: HMSPeer;
    track: HMSTrack | undefined;
    createNew?: boolean;
}): PeerTrackNode[] => {
    const {nodes, peer, track, createNew = false} = data;

    const uniqueId = getPeerTrackNodeId(peer, track);

    const nodeExists = nodes.some(node => node.id === uniqueId);

    if (nodeExists) {
        return nodes.map(node => {
            if (node.id === uniqueId) {
                return {...node, peer, track};
            }
            return node;
        });
    }

    if (!createNew) {
        return nodes;
    }

    if (peer.isLocal) {
        return [createPeerTrackNode(peer, track), ...nodes];
    }

    return [...nodes, createPeerTrackNode(peer, track)];
};

export const _updateNodeWithPeer = (data: {nodes: PeerTrackNode[]; peer: HMSPeer; createNew?: boolean}) => {
    const {nodes, peer, createNew = false} = data;

    const peerExists = nodes.some(node => node.peer.peerID === peer.peerID);

    if (peerExists) {
        return nodes.map(node => {
            if (node.peer.peerID === peer.peerID) {
                return {...node, peer};
            }
            return node;
        });
    }

    if (!createNew) {
        return nodes;
    }

    if (peer.isLocal) {
        return [createPeerTrackNode(peer), ...nodes];
    }

    return [...nodes, createPeerTrackNode(peer)];
};

const getAvailableMembers = async (peerTrackNodes: PeerTrackNode[]) => {
    let membersWithInfo: MemberInfo[] = [];
    const memberUserNames: {name: string; peer: HMSPeer}[] = [];
    await Promise.all(
        peerTrackNodes.map(async ({peer}) => {
            if (!memberUserNames.includes({name: peer.name, peer})) {
                memberUserNames.push({name: peer.name, peer});
            }
        }),
    );

    await Promise.all(
        memberUserNames.map(async ({name, peer}) => {
            const userInfoFromDB = await findAUser({username: name});

            if (userInfoFromDB) {
                membersWithInfo.push({
                    peerID: peer.peerID,
                    role: peer.role?.name,
                    name: peer.name,
                    isLocal: peer.isLocal,
                    user: userInfoFromDB,
                });
            }
        }),
    );

    return membersWithInfo;
};

export const updateMembersList = async (
    peerTrackNodes: PeerTrackNode[],
    setMembers: Dispatch<SetStateAction<MemberInfo[] | []>>,
) => {
    const membersWithInfo = await getAvailableMembers(peerTrackNodes);

    setMembers(membersWithInfo);
};

const getHostId = async (viewtype: string, viewId: string | null) => {
    if (viewtype === 'CRUView') {
        const hostId = await getCruViewHostId(viewId);
        return hostId;
    }

    if (viewtype === 'MITInvite') {
        const hostId = await getMITHostId(viewId);
        return hostId;
    }
};

export const updateHost = async (
    maxRetries = 3,
    viewtype: string,
    viewId: string | null,
    setCurrentRoomHost: Dispatch<SetStateAction<string | undefined>>,
) => {
    let attempts = 0;

    while (attempts < maxRetries) {
        const hostId = await getHostId(viewtype, viewId);

        if (hostId) {
            setCurrentRoomHost(hostId);
            return;
        } else {
            console.log('No host ID was found. Retrying...');
            attempts++;
        }
    }
};
