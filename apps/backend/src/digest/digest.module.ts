import { Module } from '@nestjs/common';
import { DigestGeneratorService } from './digest-generator.service';
import { DigestController } from './digest.controller';

@Module({
  controllers: [DigestController],
  providers: [DigestGeneratorService],
  exports: [DigestGeneratorService],
})
export class DigestModule {}
