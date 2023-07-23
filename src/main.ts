import { logger } from './logger'

interface User {
  name: string
}

const user: User = { name: 'John' }

console.log(user)

logger.debug(user)
