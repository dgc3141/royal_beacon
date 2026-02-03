import { calculateDistance, calculateBearing } from './utils';

describe('utils', () => {
    const tokyoStation = { lat: 35.6812, lng: 139.7671 };
    const imperialPalace = { lat: 35.685175, lng: 139.752800 };

    describe('calculateDistance', () => {
        test('2点間の距離を正しく計算できること', () => {
            const distance = calculateDistance(tokyoStation, imperialPalace);
            // 東京駅から皇居までは約1.3km〜1.5km程度
            // 正確な値は計算式依存だが、おおよその範囲で確認
            expect(distance).toBeGreaterThan(1.0);
            expect(distance).toBeLessThan(2.0);
        });

        test('同じ地点間の距離は0になること', () => {
            const distance = calculateDistance(tokyoStation, tokyoStation);
            expect(distance).toBe(0);
        });
    });

    describe('calculateBearing', () => {
        test('2点間の方位を正しく計算できること', () => {
            const bearing = calculateBearing(tokyoStation, imperialPalace);
            // 東京駅から見て皇居は北西方向 (270度〜360度の間)
            // 具体的には約290度付近
            expect(bearing).toBeGreaterThan(270);
            expect(bearing).toBeLessThan(360);
        });

        test('北への方位が0度(360度)に近いこと', () => {
            const southPoint = { lat: 35.0, lng: 139.0 };
            const northPoint = { lat: 36.0, lng: 139.0 };
            const bearing = calculateBearing(southPoint, northPoint);
            expect(bearing).toBeCloseTo(0, 0); // ほぼ0
        });
    });
});
