const fs = require('fs');
const path = require('path');
const { expo } = require('./app.json');

module.exports = () => {
  const localConfig = path.join(__dirname, 'google-services.json');
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON ||
    (fs.existsSync(localConfig) ? localConfig : undefined);

  if (process.env.EAS_BUILD === 'true' &&
      process.env.EAS_BUILD_PLATFORM === 'android' &&
      !googleServicesFile) {
    throw new Error('Android push setup is missing GOOGLE_SERVICES_JSON. Upload the Firebase google-services.json as an EAS file environment variable for this build environment.');
  }

  return {
    ...expo,
    android: {
      ...expo.android,
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
  };
};
