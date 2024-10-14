import App from 'lib/App.ts'

// When it is cold outside, make my room warmer by mining Monero

// These don't strictly need to be secrets, but reducing attack surface is good
const homeAssistantUrl = secrets.spaceheater_home_assistant_url
const pool = secrets.spaceheater_pool

const homeAssistantToken = secrets.spaceheater_home_assistant_token

const TEMPERATURE_THRESHOLD = 60
const SENSOR_ID = 'weather.home'
// You're welcome to send me Monero if you'd like lol
// Maybe just let me know so I can report it on my taxes
const WALLET_ADDRESS =
  '47fnJ5pbRJz32M5HXP2KfAFSTupr8VkL1iVWZpqLK5Lwco7Rp8aGxh8ZYWvmqCUYho4yVETSoYjMmBbMMXXEAzoQDGJdNvy'

import type { ComposeSpecification } from 'composepilot/compose-spec'
import secrets from 'lib/secrets'

const app: ComposeSpecification = {}

app.services = {}

app.services.app = {
  image: 'miningcontainers/xmrig:latest',
  privileged: true,
  command: ['--keepalive', '--tls', '--url', pool, '--user', WALLET_ADDRESS],
}

async function isItColdOutside() {
  const response = await fetch(`${homeAssistantUrl}/api/states/${SENSOR_ID}`, {
    headers: {
      Authorization: `Bearer ${homeAssistantToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch temperature data')
  }

  const data = await response.json()
  const { temperature } = data.attributes

  return parseFloat(temperature) < TEMPERATURE_THRESHOLD
}

export const state = (await isItColdOutside()) ? await App(app) : {}
