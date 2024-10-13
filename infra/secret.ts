const createSecrets = <T extends string>(secrets: T[]) =>
  secrets.reduce<Record<T, sst.Secret>>(
    (acc, secret) => {
      acc[secret] = new sst.Secret(secret);
      return acc;
    },
    {} as Record<T, sst.Secret>,
  );

export const allSecrets = createSecrets([
  "NEON_API_KEY",
  "ELEVEN_LABS_API_KEY",
  "ELEVEN_LABS_VOICE_ID",
]);
