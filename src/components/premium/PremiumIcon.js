import React from 'react';
import Svg, { Circle, G, Line, Path, Polyline, Rect } from 'react-native-svg';

export default function PremiumIcon({
  name,
  size = 24,
  color = '#ffffff',
  secondaryColor = color,
  strokeWidth = 2,
  style,
}) {
  const strokeProps = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  const filledStrokeProps = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };

  const renderIcon = () => {
    switch (name) {
      case 'arrow-left':
        return (
          <G {...strokeProps} fill="none">
            <Line x1="19" y1="12" x2="5" y2="12" />
            <Polyline points="12 5 5 12 12 19" />
          </G>
        );
      case 'chevron-right':
        return <Path d="M9 5l7 7-7 7" {...filledStrokeProps} />;
      case 'chevron-left':
        return <Path d="m15 5-7 7 7 7" {...filledStrokeProps} />;
      case 'chevron-down':
        return <Path d="m6 9 6 6 6-6" {...filledStrokeProps} />;
      case 'x':
        return (
          <G {...strokeProps} fill="none">
            <Line x1="6.5" y1="6.5" x2="17.5" y2="17.5" />
            <Line x1="17.5" y1="6.5" x2="6.5" y2="17.5" />
          </G>
        );
      case 'pause':
        return (
          <G fill={color}>
            <Rect x="7" y="5" width="3.2" height="14" rx="1.1" />
            <Rect x="13.8" y="5" width="3.2" height="14" rx="1.1" />
          </G>
        );
      case 'play':
        return <Path d="M8 5.5v13l10-6.5-10-6.5Z" fill={color} />;
      case 'notes':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M6 4.5h9.2L19 8.3v11.2H6V4.5Z" />
            <Path d="M15 4.8V8h3.2" />
            <Path d="M8.8 11.2h6.4" />
            <Path d="M8.8 14.5h6.4" />
            <Path d="M8.8 17.8h3.6" />
          </G>
        );
      case 'list':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M8 6h12" />
            <Path d="M8 12h12" />
            <Path d="M8 18h12" />
            <Circle cx="4.5" cy="6" r="0.7" fill={color} stroke="none" />
            <Circle cx="4.5" cy="12" r="0.7" fill={color} stroke="none" />
            <Circle cx="4.5" cy="18" r="0.7" fill={color} stroke="none" />
          </G>
        );
      case 'flag':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M6 20V5.2" />
            <Path d="M6 5.5h10.2l-1.5 4 1.5 4H6" />
          </G>
        );
      case 'bookmark':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M6.5 4.2h11a0.8 0.8 0 0 1 0.8 0.8v15l-6.3-3.6L5.7 20V5a0.8 0.8 0 0 1 0.8-0.8z" />
          </G>
        );
      case 'bookmark-filled':
        return (
          <G {...strokeProps}>
            <Path d="M6.5 4.2h11a0.8 0.8 0 0 1 0.8 0.8v15l-6.3-3.6L5.7 20V5a0.8 0.8 0 0 1 0.8-0.8z" fill={color} />
          </G>
        );
      case 'search':
        return (
          <G {...strokeProps} fill="none">
            <Circle cx="10.8" cy="10.8" r="6.2" />
            <Path d="m15.4 15.4 4.4 4.4" />
          </G>
        );
      case 'filter':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M4 6h16" />
            <Path d="M7 12h10" />
            <Path d="M10 18h4" />
          </G>
        );
      case 'check':
        return <Path d="m5 12 4.2 4.2L19 6.8" {...filledStrokeProps} />;
      case 'more-vertical':
        return (
          <G fill={color}>
            <Circle cx="12" cy="5.2" r="1.45" />
            <Circle cx="12" cy="12" r="1.45" />
            <Circle cx="12" cy="18.8" r="1.45" />
          </G>
        );
      case 'lock':
        return (
          <G {...strokeProps} fill="none">
            <Rect x="5.5" y="10.3" width="13" height="10" rx="2" />
            <Path d="M8.5 10.3V7.8a3.5 3.5 0 0 1 7 0v2.5" />
          </G>
        );
      case 'moon':
        return (
          <Path
            d="M20 14.4A8.1 8.1 0 0 1 9.6 4a7.8 7.8 0 1 0 10.4 10.4Z"
            fill={color}
            opacity="0.95"
          />
        );
      case 'sun':
        return (
          <G {...strokeProps} fill="none">
            <Circle cx="12" cy="12" r="4" />
            <Line x1="12" y1="2.5" x2="12" y2="5" />
            <Line x1="12" y1="19" x2="12" y2="21.5" />
            <Line x1="2.5" y1="12" x2="5" y2="12" />
            <Line x1="19" y1="12" x2="21.5" y2="12" />
            <Line x1="5.3" y1="5.3" x2="7" y2="7" />
            <Line x1="17" y1="17" x2="18.7" y2="18.7" />
            <Line x1="18.7" y1="5.3" x2="17" y2="7" />
            <Line x1="7" y1="17" x2="5.3" y2="18.7" />
          </G>
        );
      case 'caduceus':
        return (
          <G>
            <Path d="M12 4v16" {...filledStrokeProps} strokeWidth={1.8} />
            <Circle cx="12" cy="3.6" r="1.7" fill={color} />
            <Path d="M12 8c-3.2.2-3.6 3.6-.4 4.4 3.7.9 3.2 4.3-.6 4.7" {...filledStrokeProps} strokeWidth={1.55} />
            <Path d="M12 8c3.2.2 3.6 3.6.4 4.4-3.7.9-3.2 4.3.6 4.7" {...filledStrokeProps} strokeWidth={1.55} />
            <Path d="M10 7.6C6.6 7.2 4.3 6.1 2.5 4.2c.1 3 2.5 5.2 7.5 6.2" fill={color} opacity="0.92" />
            <Path d="M14 7.6c3.4-.4 5.7-1.5 7.5-3.4-.1 3-2.5 5.2-7.5 6.2" fill={color} opacity="0.92" />
            <Path d="M8.6 20h6.8" {...filledStrokeProps} strokeWidth={1.7} />
          </G>
        );
      case 'target':
        return (
          <G {...strokeProps} fill="none">
            <Circle cx="12" cy="12" r="8.5" />
            <Circle cx="12" cy="12" r="4.8" />
            <Circle cx="12" cy="12" r="1.8" fill={secondaryColor} stroke="none" />
            <Path d="M16.8 7.2 20 4" />
            <Path d="M18.2 3.8H20v1.8" />
          </G>
        );
      case 'chart':
        return (
          <G>
            <Rect x="4" y="12" width="3.8" height="7" rx="1.1" fill={color} opacity="0.82" />
            <Rect x="10.1" y="8.5" width="3.8" height="10.5" rx="1.1" fill={color} opacity="0.94" />
            <Rect x="16.2" y="4.5" width="3.8" height="14.5" rx="1.1" fill={secondaryColor} />
          </G>
        );
      case 'book':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M4.5 5.2c2.8-.6 5-.1 7.5 1.6v12.4c-2.4-1.7-4.8-2.2-7.5-1.6V5.2Z" />
            <Path d="M19.5 5.2c-2.8-.6-5-.1-7.5 1.6v12.4c2.4-1.7 4.8-2.2 7.5-1.6V5.2Z" />
            <Path d="M7.2 9.3c1.2 0 2.1.2 3.1.8" />
            <Path d="M16.8 9.3c-1.2 0-2.1.2-3.1.8" />
          </G>
        );
      case 'graduation-cap':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M3.5 8.3 12 4.2l8.5 4.1-8.5 4.1-8.5-4.1Z" />
            <Path d="M7.2 10.3v4.2c1.3 1.3 2.9 2 4.8 2s3.5-.7 4.8-2v-4.2" />
            <Path d="M20.5 8.3v5.3" />
            <Path d="M20.5 13.6 19.2 16" />
          </G>
        );
      case 'pencil':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M4.3 19.7 8 18.8 19.3 7.5a2 2 0 0 0 0-2.8 2 2 0 0 0-2.8 0L5.2 16 4.3 19.7Z" />
            <Path d="m14.8 6.4 2.8 2.8" />
            <Path d="M8 18.8 5.2 16" />
          </G>
        );
      case 'timer':
        return (
          <G {...strokeProps} fill="none">
            <Circle cx="12" cy="13" r="7.3" />
            <Path d="M9.2 2.8h5.6" />
            <Path d="M12 2.8V5" />
            <Path d="m17.6 7 1.6-1.6" />
            <Path d="M12 13V8.8" />
            <Path d="m12 13 3 2.1" />
          </G>
        );
      case 'brain':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M9.2 5.1a3 3 0 0 0-4.1 3.2 3 3 0 0 0-.7 5.2 3 3 0 0 0 3.2 4.5h1.6V5.1Z" />
            <Path d="M14.8 5.1a3 3 0 0 1 4.1 3.2 3 3 0 0 1 .7 5.2 3 3 0 0 1-3.2 4.5h-1.6V5.1Z" />
            <Path d="M9.2 8.3c-1 .1-1.8.7-2.2 1.7" />
            <Path d="M14.8 8.3c1 .1 1.8.7 2.2 1.7" />
            <Path d="M9.2 13.2H6.8" />
            <Path d="M14.8 13.2h2.4" />
            <Path d="M9.2 17c-1-.1-1.8-.6-2.4-1.4" />
            <Path d="M14.8 17c1-.1 1.8-.6 2.4-1.4" />
          </G>
        );
      case 'sparkles':
        return (
          <G {...strokeProps} fill="none" strokeLinejoin="round">
            <Path d="M12 3.2 13.6 8.4 18.8 10 13.6 11.6 12 16.8 10.4 11.6 5.2 10 10.4 8.4Z" />
            <Path d="M18.5 15.2 19.2 17.3 21.3 18 19.2 18.7 18.5 20.8 17.8 18.7 15.7 18 17.8 17.3Z" />
            <Path d="M5.5 3.2 6.1 5.1 8 5.7 6.1 6.3 5.5 8.2 4.9 6.3 3 5.7 4.9 5.1Z" />
          </G>
        );
      case 'person-cog':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M8.1 7.4c0-2.6 1.6-4.3 3.9-4.3s3.9 1.7 3.9 4.3c0 2.7-1.7 4.5-3.9 4.5S8.1 10.1 8.1 7.4Z" />
            <Path d="M4.7 20.5c.5-4.2 3.2-6.7 7.3-6.7s6.8 2.5 7.3 6.7" />
            <Circle cx="12" cy="7.5" r="1.2" strokeWidth={1.45} />
            <Line x1="12" y1="4.9" x2="12" y2="5.6" strokeWidth={1.35} />
            <Line x1="12" y1="9.4" x2="12" y2="10.1" strokeWidth={1.35} />
            <Line x1="9.4" y1="7.5" x2="10.1" y2="7.5" strokeWidth={1.35} />
            <Line x1="13.9" y1="7.5" x2="14.6" y2="7.5" strokeWidth={1.35} />
            <Line x1="10.2" y1="5.7" x2="10.8" y2="6.3" strokeWidth={1.35} />
            <Line x1="13.2" y1="8.7" x2="13.8" y2="9.3" strokeWidth={1.35} />
            <Line x1="13.8" y1="5.7" x2="13.2" y2="6.3" strokeWidth={1.35} />
            <Line x1="10.8" y1="8.7" x2="10.2" y2="9.3" strokeWidth={1.35} />
          </G>
        );
      case 'calculator':
        return (
          <G {...strokeProps} fill="none">
            <Rect x="5.2" y="3.5" width="13.6" height="17" rx="2.4" />
            <Rect x="8" y="6.3" width="8" height="3.3" rx="0.8" />
            <Circle cx="8.3" cy="13" r="0.7" fill={color} stroke="none" />
            <Circle cx="12" cy="13" r="0.7" fill={color} stroke="none" />
            <Circle cx="15.7" cy="13" r="0.7" fill={color} stroke="none" />
            <Circle cx="8.3" cy="16.6" r="0.7" fill={color} stroke="none" />
            <Circle cx="12" cy="16.6" r="0.7" fill={color} stroke="none" />
            <Path d="M15.7 16h0v1.2" />
          </G>
        );
      case 'shield-heart':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M12 3.5 19 6v5.4c0 4.3-2.8 7.6-7 9.1-4.2-1.5-7-4.8-7-9.1V6l7-2.5Z" />
            <Path d="M8.5 11.2c0-1.2.9-2 2-2 .7 0 1.2.3 1.5.8.3-.5.8-.8 1.5-.8 1.1 0 2 .8 2 2 0 1.8-2.2 3-3.5 4.2-1.3-1.2-3.5-2.4-3.5-4.2Z" fill={secondaryColor} stroke="none" opacity="0.92" />
          </G>
        );
      case 'stethoscope':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M6.8 4.4v4.5a4.7 4.7 0 0 0 9.4 0V4.4" />
            <Path d="M5.3 4.4h3" />
            <Path d="M14.7 4.4h3" />
            <Path d="M11.5 13.6v1.7c0 2.5 2 4.5 4.5 4.5h.8" />
            <Circle cx="18.8" cy="19.8" r="2" />
            <Circle cx="18.8" cy="19.8" r="0.7" fill={secondaryColor} stroke="none" />
          </G>
        );
      case 'flame':
        return (
          <Path
            d="M12.5 21c-4.1 0-7-2.6-7-6.4 0-2.6 1.5-4.5 3.3-6.3.1 1.6.9 2.7 2 3.3C10.7 8.2 13 5.4 16 3c-.2 3 1 4.8 2.1 6.4.8 1.1 1.4 2.3 1.4 4.3 0 4.4-3.1 7.3-7 7.3Z"
            fill={color}
          />
        );
      case 'refresh':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M20 7v5h-5" />
            <Path d="M4 17v-5h5" />
            <Path d="M18.1 12A6.5 6.5 0 0 0 6.8 7.7L4 12" />
            <Path d="M5.9 12a6.5 6.5 0 0 0 11.3 4.3L20 12" />
          </G>
        );
      case 'wifi-off':
        return (
          <G {...strokeProps} fill="none">
            <Path d="M3.5 8.4A13.7 13.7 0 0 1 12 5.5c3 0 5.7 1 7.9 2.6" />
            <Path d="M7.2 12.2A8 8 0 0 1 12 10.7c1.4 0 2.8.4 4 1.1" />
            <Path d="M10.6 16c.4-.2.9-.3 1.4-.3.6 0 1.1.1 1.6.4" />
            <Circle cx="12" cy="19.1" r="0.8" fill={color} stroke="none" />
            <Path d="M4.2 4.2 19.8 19.8" />
          </G>
        );
      case 'user':
        return (
          <G {...strokeProps} fill="none">
            <Circle cx="12" cy="8.2" r="3.8" />
            <Path d="M4.8 20.2c.6-3.9 3.4-6.2 7.2-6.2s6.6 2.3 7.2 6.2" />
          </G>
        );
      case 'pulse':
        return (
          <Polyline
            points="3 13 7 13 9 8 12.5 17 15 11 17 13 21 13"
            {...strokeProps}
            fill="none"
          />
        );
      default:
        return (
          <G {...strokeProps} fill="none">
            <Circle cx="12" cy="12" r="8" />
            <Circle cx="12" cy="12" r="2" fill={color} stroke="none" />
          </G>
        );
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {renderIcon()}
    </Svg>
  );
}
