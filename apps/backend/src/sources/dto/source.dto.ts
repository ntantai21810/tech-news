import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';
import { SourceType, Priority } from '@prisma/client';

export class CreateSourceDto {
  @IsEnum(SourceType)
  type: SourceType;

  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  checkFrequency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryTags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  checkFrequency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryTags?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
