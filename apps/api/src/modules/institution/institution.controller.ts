import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ChangeInstitutionPasswordDto } from './dto/change-institution-password.dto';
import { CreateManagedPatientAccessInviteDto } from './dto/create-managed-patient-access-invite.dto';
import { CreateManagedPatientDto } from './dto/create-managed-patient.dto';
import { UpdateInstitutionProfileDto } from './dto/update-institution-profile.dto';
import { UpdateManagedPatientDto } from './dto/update-managed-patient.dto';
import { InstitutionService } from './institution.service';

@Controller('institution')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('instituicao')
export class InstitutionController {
  private readonly institutionService: InstitutionService;

  constructor(@Inject(InstitutionService) institutionService: InstitutionService) {
    this.institutionService = institutionService;
  }

  @Get('overview')
  overview(@CurrentUser() currentUser: JwtPayload) {
    return this.institutionService.overview(currentUser);
  }

  @Get('patients')
  listPatients(
    @CurrentUser() currentUser: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('query') query?: string,
  ) {
    return this.institutionService.listPatients(currentUser, { page, pageSize, query });
  }

  @Post('patients')
  createPatient(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: CreateManagedPatientDto,
  ) {
    return this.institutionService.createPatient(currentUser, dto);
  }

  @Get('patients/:managedPatientId')
  getPatientDetail(
    @CurrentUser() currentUser: JwtPayload,
    @Param('managedPatientId') managedPatientId: string,
  ) {
    return this.institutionService.getPatientDetail(currentUser, managedPatientId);
  }

  @Patch('patients/:managedPatientId')
  updatePatient(
    @CurrentUser() currentUser: JwtPayload,
    @Param('managedPatientId') managedPatientId: string,
    @Body() dto: UpdateManagedPatientDto,
  ) {
    return this.institutionService.updatePatient(currentUser, managedPatientId, dto);
  }

  @Post('patients/:managedPatientId/access-invite')
  createPatientAccessInvite(
    @CurrentUser() currentUser: JwtPayload,
    @Param('managedPatientId') managedPatientId: string,
    @Body() dto: CreateManagedPatientAccessInviteDto,
  ) {
    return this.institutionService.createPatientAccessInvite(currentUser, managedPatientId, dto);
  }

  @Get('profile')
  profile(@CurrentUser() currentUser: JwtPayload) {
    return this.institutionService.getProfile(currentUser);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: UpdateInstitutionProfileDto,
  ) {
    return this.institutionService.updateProfile(currentUser, dto);
  }

  @Post('profile/password')
  @HttpCode(200)
  updatePassword(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: ChangeInstitutionPasswordDto,
  ) {
    return this.institutionService.changePassword(currentUser, dto);
  }
}
