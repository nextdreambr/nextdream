import {
  ForbiddenException,
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
import { CreateDreamDto } from './dto/create-dream.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';

@Injectable()
export class DreamsService {
  private readonly dreamsRepository: Repository<Dream>;
  private readonly usersRepository: Repository<User>;
  private readonly proposalsRepository: Repository<Proposal>;
  private readonly conversationsRepository: Repository<Conversation>;

  constructor(
    @InjectRepository(Dream) dreamsRepository: Repository<Dream>,
    @InjectRepository(User) usersRepository: Repository<User>,
    @InjectRepository(Proposal) proposalsRepository: Repository<Proposal>,
    @InjectRepository(Conversation) conversationsRepository: Repository<Conversation>,
  ) {
    this.dreamsRepository = dreamsRepository;
    this.usersRepository = usersRepository;
    this.proposalsRepository = proposalsRepository;
    this.conversationsRepository = conversationsRepository;
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

  async createProposal(currentUser: JwtPayload, dreamId: string, dto: CreateProposalDto) {
    if (currentUser.role !== 'apoiador') {
      throw new ForbiddenException('Only supporters can send proposals');
    }

    const supporter = await this.usersRepository.findOneByOrFail({ id: currentUser.sub });
    const dream = await this.dreamsRepository.findOneBy({ id: dreamId });
    if (!dream) {
      throw new NotFoundException('Dream not found');
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

    return {
      ...this.serializeProposal(proposal),
      conversationId: savedConversation.id,
    };
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
