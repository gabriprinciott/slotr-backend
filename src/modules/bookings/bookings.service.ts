import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateBookingDto } from "./dto/create-booking.dto";

import { EventsGateway } from "../events/events.gateway";

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    const booking = await this.prisma.booking.create({
      data: createBookingDto,
    });
    
    
    this.eventsGateway.broadcastSlotBooked(booking.date, booking.time_slot);
    
    return booking;
  }

  async findAllByDate(date: string) {
    return this.prisma.booking.findMany({
      where: { date },
      orderBy: { time_slot: "asc" },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.booking.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        
        throw new NotFoundException(`Booking with id ${id} not found`);
      }
      throw error;
    }
  }
}
