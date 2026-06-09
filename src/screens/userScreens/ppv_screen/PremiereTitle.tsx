import React from 'react';
import {Text, View} from 'react-native';
import styles from './styles';

type ParsedPremiereTitle =
    | {kind: 'simple'; text: string}
    | {kind: 'from'; before: string; after: string; last: string};

function parsePremiereTitle(title: string): ParsedPremiereTitle {
    const normalized = title.trim();
    const fromMatch = normalized.match(/^(.+?)\s+from\s+(.+)$/i);

    if (!fromMatch) {
        return {kind: 'simple', text: normalized.toUpperCase()};
    }

    const restParts = fromMatch[2].trim().split(/\s+/);
    const last = restParts.pop()?.toUpperCase() ?? '';
    const after = restParts.join(' ').toUpperCase();

    return {
        kind: 'from',
        before: fromMatch[1].trim().toUpperCase(),
        after,
        last,
    };
}

type Props = {
    title: string;
    align?: 'left' | 'center';
};

export default function PremiereTitle({title, align = 'center'}: Props) {
    const parsed = parsePremiereTitle(title);
    const isLeft = align === 'left';

    if (parsed.kind === 'simple') {
        return (
            <Text style={[styles.premiereTitleSimple, isLeft && styles.premiereTitleAlignLeft]}>
                {parsed.text}
            </Text>
        );
    }

    return (
        <View style={[styles.premiereTitleRow, isLeft && styles.premiereTitleRowLeft]}>
            <Text style={styles.premiereTitleWhite}>{parsed.before} </Text>
            <Text style={styles.premiereTitleRed}>FROM </Text>
            {parsed.after ? <Text style={styles.premiereTitleWhite}>{parsed.after} </Text> : null}
            <Text style={styles.premiereTitleGold}>{parsed.last}</Text>
        </View>
    );
}
