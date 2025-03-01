import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// モックの位置情報を設定
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation((success) => {
    success({
      coords: {
        latitude: 35.6812,
        longitude: 139.7671,
      },
    });
  }),
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
  });

  test('アプリケーションのタイトルが表示される', () => {
    render(<App />);
    const titleElement = screen.getByText('皇居コンパス');
    expect(titleElement).toBeInTheDocument();
  });

  test('コンパスが表示される', () => {
    render(<App />);
    const compassElement = screen.getByTestId('compass');
    expect(compassElement).toBeInTheDocument();
  });

  test('方位マークが表示される', () => {
    render(<App />);
    const northElement = screen.getByText('N');
    const eastElement = screen.getByText('E');
    const southElement = screen.getByText('S');
    const westElement = screen.getByText('W');

    expect(northElement).toBeInTheDocument();
    expect(eastElement).toBeInTheDocument();
    expect(southElement).toBeInTheDocument();
    expect(westElement).toBeInTheDocument();
  });

  test('距離表示が表示される', () => {
    render(<App />);
    const distanceLabelElement = screen.getByText('皇居までの距離');
    expect(distanceLabelElement).toBeInTheDocument();

    // 位置情報が取得されると距離が計算されて表示される
    // モックの位置情報を使用しているため、特定の距離が表示される
    const distanceElement = screen.getByTestId('distance-value');
    expect(distanceElement).toBeInTheDocument();
  });
});
