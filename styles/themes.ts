import { DefaultTheme, DarkTheme as DT } from '@react-navigation/native';
import { COLORS } from './colors';

export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8f9fa',
    text: COLORS.black
  },
};

export const DarkTheme = {
  ...DT,
  colors: {
    ...DT.colors,
    background: '#171717',
    text: COLORS.textDarkScreen
  },
};
