import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { ErrorResponseDto } from "../../common/dto/error-response.dto";

@ApiTags("Bookings")
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new booking",
    description:
      "Creates a new booking reservation for the specified date and time slot. Fails with 409 Conflict if the slot is already booked.",
  })
  @ApiResponse({
    status: 201,
    description: "Booking reservation created successfully",
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Validation failed on request body",
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Time slot is already booked for the selected date",
    type: ErrorResponseDto,
  })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({
    summary: "Find bookings by date",
    description:
      "Retrieves all confirmed bookings for a specific date in YYYY-MM-DD format, sorted chronologically by time slot.",
  })
  @ApiQuery({
    name: "date",
    required: false,
    description: "Filter bookings by date (YYYY-MM-DD)",
    example: "2026-09-20",
  })
  @ApiResponse({
    status: 200,
    description: "List of bookings retrieved successfully",
    type: [BookingResponseDto],
  })
  findAll(@Query("date") date: string) {
    if (!date) {
      return []; 
    }
    return this.bookingsService.findAllByDate(date);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete a booking by ID",
    description:
      "Removes an existing booking reservation by its unique identifier (UUID).",
  })
  @ApiParam({
    name: "id",
    description: "Unique identifier of the booking (UUID)",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({
    status: 200,
    description: "Booking reservation deleted successfully",
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Booking with the specified ID was not found",
    type: ErrorResponseDto,
  })
  remove(@Param("id") id: string) {
    return this.bookingsService.remove(id);
  }
}
