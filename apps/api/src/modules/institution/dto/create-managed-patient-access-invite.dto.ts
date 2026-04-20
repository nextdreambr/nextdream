import { IsEmail } from 'class-validator';

export class CreateManagedPatientAccessInviteDto {
  @IsEmail()
  email!: string;
}
