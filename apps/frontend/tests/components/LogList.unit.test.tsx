import { describe, expect,it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { LogList } from '@/components/LogList';

describe('LogList', () => {
  it('renders log messages', () => {
    const logs = [
      { id: 'l1', bot: 'b1', botId: 'b1', worker: 'w1', message: 'Test message 1', created: 1234567890 },
      { id: 'l2', bot: 'b1', botId: 'b1', worker: 'w1', message: 'Test message 2', created: 1234567891 },
    ];

    render(<LogList logs={logs} />);

    expect(screen.getByText('Test message 1')).toBeInTheDocument();
    expect(screen.getByText('Test message 2')).toBeInTheDocument();
  });

  it('renders no data message when list is empty', () => {
    render(<LogList logs={[]} />);
    expect(screen.getByText('No recent Logs.')).toBeInTheDocument();
  });

  it('renders correctly formatted time', () => {
    const date = new Date(1234567890);
    const logs = [
      { id: 'l1', bot: 'b1', botId: 'b1', worker: 'w1', message: 'Msg', created: date.getTime() }
    ];

    render(<LogList logs={logs} />);
    
    const timeElement = screen.getByText((content, element) => {
      return element?.className === 'log-time' && content.includes(date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    });
    
    expect(timeElement).toBeInTheDocument();
  });
});
