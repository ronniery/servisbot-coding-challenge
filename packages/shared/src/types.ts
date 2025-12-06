export type Bot = {
  id: string
  name: string
  description: string
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED' | string
  created: number
}

export type Log = {
  id: string
  created: string 
  message: string
  bot: string
  worker: string
}

export type Worker = {
  id: string
  name: string
  description: string
  bot: string 
  created: number
}