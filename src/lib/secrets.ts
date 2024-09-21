// Currently, I just read the secrets from .env.
// In the future, I may want to use something like Vault or Bitwarden to store them.
// This module allows me to shift how I fetch the secrets without changing the apps.
export default process.env as any
