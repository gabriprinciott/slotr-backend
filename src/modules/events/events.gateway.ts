import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RedisService } from "./redis.service";
import { Logger } from "@nestjs/common";

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  
  private clientLocks = new Map<string, { date: string; timeSlot: string }[]>();

  constructor(private readonly redisService: RedisService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const locks = this.clientLocks.get(client.id);
    if (locks && locks.length > 0) {
      for (const lock of locks) {
        await this.redisService.releaseLock(lock.date, lock.timeSlot, client.id);
        this.server.emit("SLOT_UNLOCKED", { type: 'SLOT_UNLOCKED', ...lock });
        this.logger.log(`Released lock for disconnected client: ${client.id} on ${lock.date} ${lock.timeSlot}`);
      }
      this.clientLocks.delete(client.id);
    }
  }

  @SubscribeMessage("LOCK_SLOT")
  async handleLockSlot(
    @MessageBody() payload: { date: string; timeSlot: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`LOCK_SLOT received from ${client.id} with payload: ${JSON.stringify(payload)}`);
    const success = await this.redisService.setLock(
      payload.date,
      payload.timeSlot,
      client.id,
    );
    if (success) {
      const locks = this.clientLocks.get(client.id) || [];
      locks.push(payload);
      this.clientLocks.set(client.id, locks);

      this.server.emit("SLOT_LOCKED", { type: 'SLOT_LOCKED', ...payload });
      this.logger.log(`Successfully locked and broadcasted SLOT_LOCKED for ${payload.date} ${payload.timeSlot}`);
      return { success: true };
    }
    this.logger.warn(`Failed to lock slot (already locked or redis error) for ${payload.date} ${payload.timeSlot}`);
    return { success: false, message: "Slot already locked" };
  }

  @SubscribeMessage("UNLOCK_SLOT")
  async handleUnlockSlot(
    @MessageBody() payload: { date: string; timeSlot: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`UNLOCK_SLOT received from ${client.id} with payload: ${JSON.stringify(payload)}`);
    const success = await this.redisService.releaseLock(
      payload.date,
      payload.timeSlot,
      client.id,
    );
    if (success) {
      const locks = this.clientLocks.get(client.id) || [];
      this.clientLocks.set(
        client.id,
        locks.filter((l) => l.date !== payload.date || l.timeSlot !== payload.timeSlot),
      );

      this.server.emit("SLOT_UNLOCKED", { type: 'SLOT_UNLOCKED', ...payload });
      this.logger.log(`Successfully unlocked and broadcasted SLOT_UNLOCKED for ${payload.date} ${payload.timeSlot}`);
      return { success: true };
    }
    this.logger.warn(`Failed to unlock slot for ${payload.date} ${payload.timeSlot}`);
    return { success: false };
  }

  
  async broadcastSlotBooked(date: string, timeSlot: string) {
    this.logger.log(`Broadcasting SLOT_BOOKED for ${date} ${timeSlot}`);
    
    
    this.server.emit("SLOT_BOOKED", { type: 'SLOT_BOOKED', date, timeSlot });
    
    
    
    
  }
}
