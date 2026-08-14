import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

// モックの位置情報を設定
const mockGeolocation = {
  watchPosition: vi.fn().mockImplementation((success) => {
    success({
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
        accuracy: 15,
      },
    });
    return 1; // watchId
  }),
  clearWatch: vi.fn(),
};

// グローバルのnavigatorオブジェクトをモック
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('皇居コンパスアプリ', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
  });

  it('初期状態ではローディングが表示される', () => {
    const mockWatchPosition = vi.fn();
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        ...mockGeolocation,
        watchPosition: mockWatchPosition,
      },
      writable: true,
    });

    render(<App />);
    const loadingElement = screen.getByText('GPS取得中...');
    expect(loadingElement).toBeInTheDocument();
  });

  it('位置情報取得後にコンパスと距離が表示される', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('GPS取得中...')).not.toBeInTheDocument();
    });

    const titleElement = screen.getByText('皇居コンパス');
    expect(titleElement).toBeInTheDocument();

    const compassElement = screen.getByTestId('compass');
    expect(compassElement).toBeInTheDocument();

    const distanceElement = screen.getByTestId('distance-value');
    expect(distanceElement).toBeInTheDocument();
    expect(distanceElement).not.toHaveTextContent('--');
  });
});
