import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'

let io: SocketServer | null = null

export function getSocketIO(httpServer?: HttpServer): SocketServer | null {
  if (io) return io

  if (httpServer) {
    io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
      path: '/api/socketio',
    })

    io.on('connection', (socket) => {
      console.log(`[Socket] Client connected: ${socket.id}`)

      socket.on('subscribe:leaderboard', () => {
        socket.join('leaderboard')
      })

      socket.on('subscribe:player', (playerId: string) => {
        socket.join(`player:${playerId}`)
      })

      socket.on('subscribe:match', (matchId: string) => {
        socket.join(`match:${matchId}`)
      })

      socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`)
      })
    })

    return io
  }

  return null
}

export function emitLeaderboardUpdate(data: unknown) {
  io?.to('leaderboard').emit('leaderboard:update', data)
}

export function emitPlayerUpdate(playerId: string, data: unknown) {
  io?.to(`player:${playerId}`).emit('player:update', data)
}

export function emitMatchUpdate(matchId: string, data: unknown) {
  io?.to(`match:${matchId}`).emit('match:update', data)
}

export function emitGlobalNotification(data: { type: string; message: string; data?: unknown }) {
  io?.emit('notification', data)
}
