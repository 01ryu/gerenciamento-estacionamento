import React from 'react';
import Svg, { Path, Rect, Circle, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

// Original vector mark: a car behind a raised parking barrier.
export function ParkingLogo({ size = 56 }) {
  return <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="Logo Órbita: carro e cancela levantada">
    <Defs><LinearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#72E5FF"/><Stop offset="1" stopColor="#7184FF"/></LinearGradient></Defs>
    <Rect x="2" y="2" width="96" height="96" rx="27" fill="#112443" stroke="#2B466D"/>
    <Path d="M19 61L24 45Q26 40 32 40H50Q56 40 58 46L62 61V75H19Z" fill="url(#brand)"/>
    <Path d="M28 45H49L53 56H24Z" fill="#0B1A31"/>
    <Rect x="23" y="62" width="9" height="4" rx="2" fill="#F1FCFF"/><Rect x="49" y="62" width="9" height="4" rx="2" fill="#F1FCFF"/>
    <Rect x="22" y="73" width="9" height="8" rx="3" fill="#65DAF5"/><Rect x="51" y="73" width="9" height="8" rx="3" fill="#8796FF"/>
    <Rect x="70" y="49" width="12" height="32" rx="4" fill="#DDEBFF"/>
    <Path d="M76 51L42 20" stroke="#DDEBFF" strokeWidth="8" strokeLinecap="round"/>
    <Path d="M49 26L55 31M62 38L68 43" stroke="#617DFF" strokeWidth="8"/>
    <Circle cx="76" cy="52" r="4" fill="#61E8D1"/>
    <Path d="M16 85H85" stroke="#42628B" strokeWidth="2" strokeLinecap="round"/>
  </Svg>;
}

export function Icon({ name, size = 22, color = '#A9BBD6' }) {
  const paths = {
    home: 'M3 10L12 3L21 10M5 9V21H10V15H14V21H19V9',
    grid: 'M3 3H9V9H3ZM15 3H21V9H15ZM3 15H9V21H3ZM15 15H21V21H15Z',
    car: 'M4 11L6 5H18L20 11M3 11H21V19H3ZM6 19V21M18 19V21M6 14H8M16 14H18',
    clock: 'M12 7V12L16 14M21 12A9 9 0 1 1 3 12A9 9 0 1 1 21 12',
    arrow: 'M5 12H19M13 6L19 12L13 18',
    back: 'M19 12H5M11 6L5 12L11 18',
    plus: 'M12 5V19M5 12H19',
    check: 'M5 12L10 17L20 7',
    exit: 'M10 4H4V20H10M9 12H21M16 7L21 12L16 17',
    close: 'M6 6L18 18M18 6L6 18',
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><Path d={paths[name] || paths.grid} fill="none" stroke={color} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
}

export function OrbitArt() {
  return <Svg width="100%" height="100%" viewBox="0 0 420 280" aria-hidden>
    <Defs><LinearGradient id="orbit" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#68DBFF" stopOpacity="0.7"/><Stop offset="1" stopColor="#766EFF" stopOpacity="0.08"/></LinearGradient></Defs>
    <Circle cx="226" cy="144" r="104" fill="#102444"/>
    <Circle cx="226" cy="144" r="80" fill="#152D50"/>
    <Ellipse cx="226" cy="144" rx="172" ry="58" transform="rotate(-25 226 144)" fill="none" stroke="url(#orbit)" strokeWidth="1.5"/>
    <Ellipse cx="226" cy="144" rx="140" ry="111" transform="rotate(-25 226 144)" fill="none" stroke="#29456F" strokeWidth="1"/>
    <Path d="M151 150L166 111Q169 105 178 105H243Q252 105 255 112L268 150V192H151Z" fill="#223F64" stroke="#83BCF0" strokeWidth="2"/>
    <Path d="M177 115H241L252 144H165Z" fill="#0A1931"/>
    <Path d="M161 161H183M237 161H259" stroke="#8ADFFF" strokeWidth="5" strokeLinecap="round"/>
    <Rect x="199" y="169" width="22" height="9" rx="3" fill="#759BC5"/>
    <Rect x="158" y="190" width="17" height="12" rx="4" fill="#6E9FCB"/><Rect x="245" y="190" width="17" height="12" rx="4" fill="#6E9FCB"/>
    <Rect x="291" y="129" width="20" height="77" rx="5" fill="#A5C8F5"/>
    <Path d="M301 135L233 64" stroke="#D9EBFF" strokeWidth="12" strokeLinecap="round"/>
    <Path d="M245 77L255 88M269 102L279 113" stroke="#657CF4" strokeWidth="12"/>
    <Circle cx="301" cy="136" r="6" fill="#64E9CC"/>
    <Circle cx="90" cy="188" r="5" fill="#79DDFF"/><Circle cx="336" cy="72" r="3" fill="#8E8AFF"/>
    {[[48,56],[103,88],[352,206],[185,35],[370,132],[124,228],[281,247]].map(([x,y],i)=><Circle key={i} cx={x} cy={y} r={i%2?1:1.8} fill="#A9BFE9" opacity="0.6"/>)}
  </Svg>;
}
