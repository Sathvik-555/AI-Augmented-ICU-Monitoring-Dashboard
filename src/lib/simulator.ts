import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchVitalDBData, VitalDataPoint } from './vitaldb';

export type VitalSigns = {
    hr: number;      // Heart Rate (bpm)
    sbp: number;     // Systolic BP (mmHg)
    dbp: number;     // Diastolic BP (mmHg)
    spo2: number;    // Oxygen Saturation (%)
    rr: number;      // Respiratory Rate (breaths/min)
    temp: number;    // Temperature (C)
    timestamp: number;
};

export type ClinicalScenario = 'NORMAL' | 'SEPSIS' | 'RESPIRATORY_DISTRESS' | 'CARDIAC_INSTABILITY' | 'VITALDB_DEMO';

const BASELINE: Record<string, Omit<VitalSigns, 'timestamp'>> = {
    NORMAL: { hr: 75, sbp: 120, dbp: 80, spo2: 98, rr: 16, temp: 37.0 },
    SEPSIS: { hr: 115, sbp: 95, dbp: 60, spo2: 94, rr: 24, temp: 39.2 },
    RESPIRATORY_DISTRESS: { hr: 105, sbp: 130, dbp: 85, spo2: 88, rr: 35, temp: 37.2 },
    CARDIAC_INSTABILITY: { hr: 45, sbp: 85, dbp: 50, spo2: 92, rr: 14, temp: 36.5 },
    VITALDB_DEMO: { hr: 80, sbp: 120, dbp: 80, spo2: 98, rr: 16, temp: 37.0 } // Default start
};

export function useVitalSimulator(scenario: ClinicalScenario) {
    const [vitals, setVitals] = useState<VitalSigns>({
        ...BASELINE.NORMAL,
        timestamp: Date.now(),
    });

    const [history, setHistory] = useState<VitalSigns[]>([]);
    const [realData, setRealData] = useState<VitalDataPoint[]>([]);
    const playbackIndexRef = useRef(0);
    const [isLoading, setIsLoading] = useState(false);

    const drift = useCallback((current: number, target: number, variability: number, speed: number = 0.1) => {
        const noise = (Math.random() - 0.5) * variability;
        const delta = (target - current) * speed;
        return current + delta + noise;
    }, []);

    // Fetch Real Data
    useEffect(() => {
        if (scenario === 'VITALDB_DEMO' && realData.length === 0 && !isLoading) {
            setIsLoading(true);
            fetchVitalDBData()
                .then(data => {
                    console.log(`[Simulator] Loaded ${data.length} points from VitalDB`);
                    setRealData(data);
                    playbackIndexRef.current = 0;
                })
                .catch(err => console.error("Failed to load VitalDB data", err))
                .finally(() => setIsLoading(false));
        }
    }, [scenario, realData.length, isLoading]);

    useEffect(() => {
        const interval = setInterval(() => {
            setVitals(prev => {
                let newVitals: VitalSigns;

                if (scenario === 'VITALDB_DEMO' && realData.length > 0) {
                    const point = realData[playbackIndexRef.current];
                    playbackIndexRef.current = (playbackIndexRef.current + 1) % realData.length;

                    newVitals = {
                        hr: Math.round(point.hr),
                        sbp: Math.round(point.sbp),
                        dbp: Math.round(point.dbp),
                        spo2: Math.round(point.spo2),
                        rr: Math.round(point.rr),
                        temp: Number(point.temp.toFixed(1)),
                        timestamp: Date.now()
                    };
                } else {
                    // Synthetic Drift
                    const target = BASELINE[scenario] || BASELINE.NORMAL;
                    newVitals = {
                        hr: Math.round(drift(prev.hr, target.hr, 2)),
                        sbp: Math.round(drift(prev.sbp, target.sbp, 3)),
                        dbp: Math.round(drift(prev.dbp, target.dbp, 2)),
                        spo2: Math.min(100, Math.round(drift(prev.spo2, target.spo2, 1))),
                        rr: Math.round(drift(prev.rr, target.rr, 1)),
                        temp: Number(drift(prev.temp, target.temp, 0.1).toFixed(1)),
                        timestamp: Date.now(),
                    };
                }

                setHistory(h => [...h.slice(-59), newVitals]);
                return newVitals;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [scenario, drift, realData]);

    return { vitals, history, isLoading };
}
