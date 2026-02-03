import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// モックの位置情報を設定
const mockGeolocation = {
  watchPosition: jest.fn().mockImplementation((success) => {
    success({
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
      },
    });
    return 1; // watchId
  }),
  clearWatch: jest.fn(),
};

// グローバルのnavigatorオブジェクトをモック
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// デバイスの向きイベントをモック
const mockDeviceOrientation = {
  alpha: 45,
};

describe('皇居コンパスアプリ', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();

    // デフォルトのモック（成功パターン）を設定
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
  });

  test('初期状態ではローディングが表示される', () => {
    // ローディング中を再現するため、コールバックを呼ばないモックを設定
    const mockWatchPosition = jest.fn();
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        ...mockGeolocation,
        watchPosition: mockWatchPosition,
      },
      writable: true,
    });

    render(<App />);
    const loadingElement = screen.getByText('読み込み中...');
    expect(loadingElement).toBeInTheDocument();
  });

  test('位置情報取得後にコンパスと距離が表示される', async () => {
    render(<App />);

    // 位置情報取得完了待ち
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    const titleElement = screen.getByText('皇居コンパス');
    expect(titleElement).toBeInTheDocument();

    const compassElement = screen.getByTestId('compass');
    expect(compassElement).toBeInTheDocument();

    const distanceLabelElement = screen.getByText('皇居までの距離');
    expect(distanceLabelElement).toBeInTheDocument();

    const distanceElement = screen.getByTestId('distance-value');
    expect(distanceElement).toBeInTheDocument();
    // 距離が数値で表示されていることを確認 (-- ではない)
    expect(distanceElement).not.toHaveTextContent('--');
  });
});
