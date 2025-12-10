import { beforeEach,describe, expect, it, vi } from 'vitest';

import { fireEvent,render, screen, waitFor } from '@testing-library/react';

import { Bot, BotStatus } from '@packages/shared';
import { BotCardProps } from '@/components/BotCard';
import { Application } from '@/pages';
import { BotService } from '@/services/bot.service';

type GetBotsResponse = Awaited<ReturnType<typeof BotService.getBots>>;

vi.mock('@/components/BotCard', () => ({
  BotCard: ({ bot, isExpanded, onToggle }: BotCardProps) => (
    <div data-testid="bot-card" onClick={() => onToggle(bot.id)}>
      {bot.name} - {isExpanded ? 'Expanded' : 'Collapsed'}
    </div>
  ),
}));

vi.mock('@/services/bot.service', () => ({
  BotService: {
    getBots: vi.fn(),
  },
}));

describe('Application', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(BotService.getBots).mockResolvedValue({
      data: [],
      pagination: { hasNext: false, total: 0, page: 1, limit: 10, totalPages: 0 },
    } as GetBotsResponse);
  });

  it('renders header', async () => {
    render(<Application />);
    expect(screen.getByText('Bot Management')).toBeInTheDocument();

    await waitFor(() => expect(BotService.getBots).toHaveBeenCalled());
  });

  it('renders list of bots', async () => {
    const mockBots: Bot[] = [
      { id: '1', name: 'Bot 1', description: 'd1', status: BotStatus.ENABLED, created: 1 },
      { id: '2', name: 'Bot 2', description: 'd2', status: BotStatus.DISABLED, created: 2 },
    ];

    vi.mocked(BotService.getBots).mockResolvedValue({
      data: mockBots,
      pagination: { hasNext: false },
    } as GetBotsResponse);

    render(<Application />);

    await waitFor(() => {
      expect(screen.getAllByTestId('bot-card')).toHaveLength(2);
    });

    expect(screen.getByText('Bot 1 - Collapsed')).toBeInTheDocument();
  });

  it('toggles bot accordion', async () => {
    const mockBots: Bot[] = [
      { id: '1', name: 'Bot 1', description: 'd1', status: BotStatus.ENABLED, created: 1 },
    ];

    vi.mocked(BotService.getBots).mockResolvedValue({
      data: mockBots,
      pagination: { hasNext: false },
    } as GetBotsResponse);

    render(<Application />);

    await waitFor(() => {
      expect(screen.getByTestId('bot-card')).toBeInTheDocument();
    });

    const botCard = screen.getByTestId('bot-card');
    fireEvent.click(botCard);

    expect(screen.getByText('Bot 1 - Expanded')).toBeInTheDocument();

    fireEvent.click(botCard);
    expect(screen.getByText('Bot 1 - Collapsed')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    render(<Application />);
    await waitFor(() => {
      expect(screen.getByText('No Bots found.')).toBeInTheDocument();
    });
  });

  it('shows load more bots button', async () => {
    vi.mocked(BotService.getBots).mockImplementation(async (params) => {
      if (params?.page === 1) {
        return {
          data: [{ id: '1', name: 'Bot 1', description: 'd1', status: BotStatus.ENABLED, created: 1 }],
          pagination: { hasNext: true },
        } as GetBotsResponse;
      }

      return {
        data: [{ id: '2', name: 'Bot 2', description: 'd2', status: BotStatus.DISABLED, created: 2 }],
        pagination: { hasNext: false },
      } as GetBotsResponse;
    });

    render(<Application />);

    await waitFor(() => {
      expect(screen.getByText('Load More Bots')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Load More Bots'));

    await waitFor(() => {
      expect(BotService.getBots).toHaveBeenCalledTimes(2);
    });
  });
});
