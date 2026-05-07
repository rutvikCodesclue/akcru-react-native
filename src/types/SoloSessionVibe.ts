/**
 * Vibe options a user can pick when starting a Solo Session.
 * Used by the Solo Session bottom sheet (selection) and the
 * Solo Session screen (route param + label rendering).
 *
 * String values match the API contract for `POST /v1/solo-session/vibe`.
 */
export enum SoloSessionVibe {
    JustBrowsing = 'JUST_BROWSING',
    ChillRelax = 'CHILL_RELAX',
    LateNightVibes = 'LATE_NIGHT_VIBES',
    SomethingGood = 'SOMETHING_GOOD',
    MightInviteSomeone = 'MIGHT_INVITE_SOMEONE',
}

/**
 * UI-side ids used by the bottom-sheet vibe options. Kept as a literal union
 * so callers get autocompletion when mapping to the API enum.
 */
export type SoloSessionVibeId = 'browsing' | 'chill' | 'vibes' | 'something' | 'invite';

/** Map of bottom-sheet ids to API enum values. */
export const SOLO_VIBE_ID_TO_API_VIBE: Record<SoloSessionVibeId, SoloSessionVibe> = {
    browsing: SoloSessionVibe.JustBrowsing,
    chill: SoloSessionVibe.ChillRelax,
    vibes: SoloSessionVibe.LateNightVibes,
    something: SoloSessionVibe.SomethingGood,
    invite: SoloSessionVibe.MightInviteSomeone,
};

/**
 * Resolve a bottom-sheet vibe id (e.g. 'chill') to its API enum value
 * (e.g. SoloSessionVibe.ChillRelax). Returns `undefined` for unknown ids
 * so callers can decide how to handle the gap.
 */
export const resolveSoloSessionVibe = (vibeId: string | null | undefined): SoloSessionVibe | undefined => {
    if (!vibeId) {
        return undefined;
    }
    return SOLO_VIBE_ID_TO_API_VIBE[vibeId as SoloSessionVibeId];
};
