import { IsIn } from 'class-validator';

export class DemoLoginDto {
  @IsIn(['paciente', 'apoiador', 'instituicao'])
  persona!: 'paciente' | 'apoiador' | 'instituicao';
}
