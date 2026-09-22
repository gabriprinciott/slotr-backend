import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, Matches } from "class-validator";

export class CreateBookingDto {
  @ApiProperty({
    description: "Full name of the person making the booking",
    example: "Mario Rossi",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Booking reservation date in YYYY-MM-DD format",
    example: "2026-09-20",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "date must be in YYYY-MM-DD format",
  })
  date: string;

  @ApiProperty({
    description: "Time slot interval in HH:MM-HH:MM format",
    example: "10:00-11:00",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}-\d{2}:\d{2}$/, {
    message: "time_slot must be in HH:MM-HH:MM format",
  })
  time_slot: string;

  @ApiPropertyOptional({
    description: "Optional note or special request for the booking",
    example: "Window seat preferred",
  })
  @IsString()
  @IsOptional()
  note?: string;
}
