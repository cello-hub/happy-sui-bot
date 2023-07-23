import { Ed25519Keypair } from '@mysten/sui.js'

const phrase = process.env.ADMIN_PHRASE
export const keypair = Ed25519Keypair.deriveKeypair(phrase!)
