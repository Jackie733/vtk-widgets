import { createVuetify } from 'vuetify';

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'appDark',
    themes: {
      appDark: {
        dark: true,
        colors: {
          'selection-bg-color': '#039BE5',
          'selection-border-color': '#039BE5',
        },
      },
    },
  },
  display: {
    mobileBreakpoint: 'lg',
    thresholds: {
      lg: 1024,
    },
  },
});
vuetify.theme.global.name.value = 'appDark';

export default vuetify;
