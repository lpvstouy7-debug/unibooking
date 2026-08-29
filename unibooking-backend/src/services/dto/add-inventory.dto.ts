import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class InventoryEntryDto {
  @IsDateString()
  date!: string;

  @IsInt()
  @Min(0)
  availableUnits!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;
}

/**
 * Accepts a batch of date entries in one call -- a supplier setting up a
 * season's pricing is setting dozens of dates at once, not one at a time.
 * ServicesService.addInventory() upserts the whole batch inside a single
 * transaction (see @@unique([serviceId, date]) in schema.prisma).
 */
export class AddInventoryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InventoryEntryDto)
  entries!: InventoryEntryDto[];
}
