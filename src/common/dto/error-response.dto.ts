import { ApiProperty } from "@nestjs/swagger";

export class ErrorResponseDto {
  @ApiProperty({
    description: "HTTP status code",
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: "Error message or list of validation error descriptions",
    oneOf: [
      { type: "string", example: "Bad Request" },
      {
        type: "array",
        items: { type: "string" },
        example: ["name should not be empty"],
      },
    ],
  })
  message: string | string[];

  @ApiProperty({
    description: "Timestamp of when the error occurred in ISO 8601 format",
    example: "2026-09-20T10:30:00.000Z",
  })
  timestamp: string;
}
