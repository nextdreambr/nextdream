import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { ManagedPatient } from '../../entities/managed-patient.entity';
import { Proposal } from '../../entities/proposal.entity';
import { User } from '../../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { InstitutionController } from './institution.controller';
import { InstitutionService } from './institution.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ManagedPatient, User, Dream, Proposal, Conversation]),
    AuthModule,
  ],
  controllers: [InstitutionController],
  providers: [InstitutionService],
  exports: [InstitutionService],
})
export class InstitutionModule {}
