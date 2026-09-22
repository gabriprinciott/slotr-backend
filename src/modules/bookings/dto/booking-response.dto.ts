import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BookingResponseDto {
  @ApiProperty({
    description: "Unique identifier of the booking (UUID)",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  id: string;

  @ApiProperty({
    description: "Customer or booking holder full name",
    example: "Mario Rossi",
  })
  name: string;

  @ApiProperty({
    description: "Booking reservation date in YYYY-MM-DD format",
    example: "2026-09-20",
  })
  date: string;

  @ApiProperty({
    description: "Reserved time slot in HH:MM-HH:MM format",
    example: "10:00-11:00",
  })
  time_slot: string;

  @ApiPropertyOptional({
    description: "Additional notes or requirements for the booking",
    example: "Window seat preferred",
    nullable: true,
  })
  note?: string | null;

  @ApiProperty({
    description: "Timestamp when the booking record was created",
    example: "2026-09-20T10:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Timestamp when the booking record was last updated",
    example: "2026-09-20T10:00:00.000Z",
  })
  updatedAt: Date;
}
