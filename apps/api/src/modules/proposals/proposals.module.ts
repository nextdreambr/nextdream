import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DreamsModule } from '../dreams/dreams.module';
import { ProposalsController } from './proposals.controller';

@Module({
  imports: [DreamsModule, AuthModule],
  controllers: [ProposalsController],
})
export class ProposalsModule {}
