import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Dream } from '../../entities/dream.entity';
import { Proposal } from '../../entities/proposal.entity';
import { User } from '../../entities/user.entity';
import { JwtPayload } from '../auth/jwt-auth.guard';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDreamDto } from './dto/create-dream.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';

@Injectable()
export class DreamsService {
  private readonly dreamsRepository: Repository<Dream>;
  private readonly usersRepository: Repository<User>;
  private readonly proposalsRepository: Repository<Proposal>;
  private readonly conversationsRepository: Repository<Conversation>;
  private readonly notificationsService: NotificationsService;

  constructor(
    @InjectRepository(Dream) dreamsRepository: Repository<Dream>,
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(Proposal) proposalsRepository: Repository<Proposal>,
    @InjectRepository(Conversation) conversationsRepository: Repository<Conversation>,
    @Inject(NotificationsService) notificationsService: NotificationsService,
  ) {
    this.dreamsRepository = dreamsRepository;
    this.usersRepository = usersRepository;
    this.proposalsRepository = proposalsRepository;
    this.conversationsRepository = conversationsRepository;
    this.notificationsService = notificationsService;
  }

  async createDream(currentUser: JwtPayload, dto: CreateDreamDto) {
    if (currentUser.role !== 'paciente') {
      throw new ForbiddenException('Only patients can create dreams');
    }

    const patient = await this.usersRepository.findOneByOrFail({ id: currentUser.sub });

    const dream = this.dreamsRepository.create({
      ...dto,
      status: 'publicado',
      patient,
      patientId: patient.id,
    });

    const saved = await this.dreamsRepository.save(dream);
    return this.serializeDream(saved);
  }

  async listPublicDreams() {
    const dreams = await this.dreamsRepository.find({
      where: { status: 'publicado' },
      order: { createdAt: 'DESC' },
    });

    return dreams.map((dream) => this.serializeDream(dream));
  }

  async getDreamForUser(currentUser: JwtPayload, dreamId: string) {
    const dream = await this.dreamsRepository.findOneBy({ id: dreamId });
    if (!dream) {
      throw new NotFoundException('Dream not found');
    }

    if (currentUser.role === 'admin') {
      return this.serializeDream(dream);
    }

    if (currentUser.role === 'paciente' && dream.patientId === currentUser.sub) {
      return this.serializeDream(dream);
    }

    if (currentUser.role === 'apoiador') {
      const hasProposal = await this.proposalsRepository.findOneBy({
        dreamId: dream.id,
        supporterId: currentUser.sub,
      });

      if (dream.status === 'publicado' || hasProposal) {
        return this.serializeDream(dream);
      }
    }

    throw new ForbiddenException('You are not allowed to view this dream');
  }

  async listMyDreams(currentUser: JwtPayload) {
    if (currentUser.role !== 'paciente') {
      throw new ForbiddenException('Only patients can list their dreams');
    }

    const dreams = await this.dreamsRepository.find({
      where: { patientId: currentUser.sub },
      order: { createdAt: 'DESC' },
    });

    return dreams.map((dream) => this.serializeDream(dream));
  }

  async listDreamProposals(currentUser: JwtPayload, dreamId: string) {
    const dream = await this.dreamsRepository.findOneBy({ id: dreamId });
    if (!dream) {
      throw new NotFoundException('Dream not found');
    }
    if (dream.patientId !== currentUser.sub) {
      throw new ForbiddenException('Only the dream owner can view proposals');
    }

    const proposals = await this.proposalsRepository.find({
      where: { dreamId: dream.id },
      order: { createdAt: 'DESC' },
    });

    return proposals.map((proposal) => this.serializeProposal(proposal));
  }

  async createProposal(currentUser: JwtPayload, dreamId: string, dto: CreateProposalDto) {
    if (currentUser.role !== 'apoiador') {
      throw new ForbiddenException('Only supporters can send proposals');
    }

    const supporter = await this.usersRepository.findOneByOrFail({ id: currentUser.sub });
    const dream = await this.dreamsRepository.findOneBy({ id: dreamId });
    if (!dream) {
      throw new NotFoundException('Dream not found');
    }
    if (dream.status !== 'publicado') {
      throw new ConflictException('Este sonho não está disponível para novas propostas.');
    }

    const existingProposal = await this.proposalsRepository.findOneBy({
      dreamId: dream.id,
      supporterId: supporter.id,
    });
    if (existingProposal) {
      throw new ConflictException('Você já enviou uma proposta para este sonho.');
    }

    const proposal = this.proposalsRepository.create({
      ...dto,
      dream,
      dreamId: dream.id,
      supporter,
      supporterId: supporter.id,
      status: 'enviada',
    });

    const saved = await this.proposalsRepository.save(proposal);

    await this.notificationsService.createNotification({
      userId: dream.patientId,
      type: 'proposta',
      title: 'Nova proposta recebida',
      message: `${supporter.name} enviou uma proposta para "${dream.title}".`,
      actionPath: '/paciente/propostas',
    });

    return this.serializeProposal(saved);
  }

  async acceptProposal(currentUser: JwtPayload, proposalId: string) {
    const proposal = await this.proposalsRepository.findOneBy({ id: proposalId });
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const dream = await this.dreamsRepository.findOneByOrFail({ id: proposal.dreamId });
    if (dream.patientId !== currentUser.sub) {
      throw new ForbiddenException('Only the dream owner can accept proposals');
    }

    proposal.status = 'aceita';
    dream.status = 'em-conversa';
    await this.proposalsRepository.save(proposal);
    await this.dreamsRepository.save(dream);

    const conversation = this.conversationsRepository.create({
      dreamId: dream.id,
      patientId: dream.patientId,
      supporterId: proposal.supporterId,
      status: 'ativa',
    });

    const savedConversation = await this.conversationsRepository.save(conversation);

    await this.notificationsService.createNotification({
      userId: proposal.supporterId,
      type: 'aceito',
      title: 'Proposta aceita',
      message: `Sua proposta para "${dream.title}" foi aceita.`,
      actionPath: `/apoiador/chat?conversationId=${savedConversation.id}`,
    });

    await this.notificationsService.createNotification({
      userId: dream.patientId,
      type: 'aceito',
      title: 'Conversa iniciada',
      message: `Você iniciou uma conversa para "${dream.title}".`,
      actionPath: `/paciente/chat?conversationId=${savedConversation.id}`,
    });

    return {
      ...this.serializeProposal(proposal),
      conversationId: savedConversation.id,
    };
  }

  async listSupporterProposals(currentUser: JwtPayload) {
    if (currentUser.role !== 'apoiador') {
      throw new ForbiddenException('Only supporters can list their proposals');
    }

    const proposals = await this.proposalsRepository.find({
      where: { supporterId: currentUser.sub },
      order: { createdAt: 'DESC' },
    });

    return proposals.map((proposal) => this.serializeProposal(proposal));
  }

  async listReceivedProposals(currentUser: JwtPayload) {
    if (currentUser.role !== 'paciente') {
      throw new ForbiddenException('Only patients can list received proposals');
    }

    const proposals = await this.proposalsRepository
      .createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.dream', 'dream')
      .leftJoinAndSelect('proposal.supporter', 'supporter')
      .where('dream.patientId = :patientId', { patientId: currentUser.sub })
      .orderBy('proposal.createdAt', 'DESC')
      .getMany();

    return proposals.map((proposal) => this.serializeProposal(proposal));
  }

  private serializeDream(dream: Dream) {
    return {
      id: dream.id,
      title: dream.title,
      description: dream.description,
      category: dream.category,
      format: dream.format,
      urgency: dream.urgency,
      privacy: dream.privacy,
      status: dream.status,
      patientId: dream.patientId,
      patientName: dream.patient?.name,
      patientCity: dream.patient?.city,
      createdAt: dream.createdAt,
      updatedAt: dream.updatedAt,
    };
  }

  private serializeProposal(proposal: Proposal) {
    return {
      id: proposal.id,
      dreamId: proposal.dreamId,
      dreamTitle: proposal.dream?.title,
      dreamStatus: proposal.dream?.status,
      dreamCategory: proposal.dream?.category,
      supporterId: proposal.supporterId,
      supporterName: proposal.supporter?.name,
      message: proposal.message,
      offering: proposal.offering,
      availability: proposal.availability,
      duration: proposal.duration,
      status: proposal.status,
      createdAt: proposal.createdAt,
    };
  }
}
