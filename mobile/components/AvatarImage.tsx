import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse } from 'react-native-svg';

interface AvatarImageProps {
  url: string | null;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
}

// WhatsApp-style silhouette shown when no photo has been uploaded
function Placeholder({ size }: { size: number }) {
  const head = size * 0.22;
  const bodyRx = size * 0.3;
  const bodyRy = size * 0.24;

  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* head */}
        <Circle cx={size / 2} cy={size * 0.37} r={head} fill="rgba(255,255,255,0.85)" />
        {/* body/shoulders */}
        <Ellipse
          cx={size / 2}
          cy={size * 0.88}
          rx={bodyRx}
          ry={bodyRy}
          fill="rgba(255,255,255,0.85)"
        />
      </Svg>
    </View>
  );
}

export function AvatarImage({ url, size = 64, borderColor = '#FFD700', borderWidth = 2 }: AvatarImageProps) {
  const [failed, setFailed] = useState(false);

  // Reset failed flag whenever the URL changes (e.g. after a successful upload)
  React.useEffect(() => {
    setFailed(false);
  }, [url]);

  const showPlaceholder = !url || failed;

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          borderWidth,
        },
      ]}
    >
      {showPlaceholder ? (
        <Placeholder size={size - borderWidth * 2} />
      ) : (
        <Image
          source={{ uri: url }}
          style={{ width: size - borderWidth * 2, height: size - borderWidth * 2, borderRadius: (size - borderWidth * 2) / 2 }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
