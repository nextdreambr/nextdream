import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MailService } from '../src/modules/mail/mail.service';
import { AdminService } from '../src/modules/admin/admin.service';

describe('AdminService.inviteAdmin', () => {
  const usersRepository = {
    findOne: vi.fn(),
  };
  const adminInvitesRepository = {
    delete: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const mailService = {
    sendAdminInviteEmail: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_URL = 'http://localhost:5173';
  });

  it('reverts the persisted invite when the email send fails', async () => {
    usersRepository.findOne.mockResolvedValue(null);
    adminInvitesRepository.create.mockImplementation((invite) => invite);
    adminInvitesRepository.save.mockImplementation(async (invite) => ({
      id: 'invite-1',
      ...invite,
    }));
    mailService.sendAdminInviteEmail.mockRejectedValue(new Error('resend down'));

    const service = new (AdminService as any)(
      usersRepository,
      {},
      {},
      {},
      {},
      {},
      adminInvitesRepository,
      {},
      {},
      mailService as unknown as MailService,
    );

    await expect(
      service.inviteAdmin(
        { sub: 'admin-1' },
        { email: 'new-admin@example.com' },
      ),
    ).rejects.toThrow('resend down');

    expect(adminInvitesRepository.delete).toHaveBeenNthCalledWith(1, {
      email: 'new-admin@example.com',
    });
    expect(adminInvitesRepository.delete).toHaveBeenNthCalledWith(2, {
      id: 'invite-1',
    });
    expect(mailService.sendAdminInviteEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new-admin@example.com',
      }),
    );
  });
});
