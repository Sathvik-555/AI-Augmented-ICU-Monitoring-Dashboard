export const CASE_1_TIDS = {
    HR: "6326f61f2b89f8afb550c102fd1b9c9e44249fe0",
    SBP: "69128c2f14c14d5a74170946ea88e8d5d8ef0bfa",
    DBP: "22f7c87e40887e437db5e0f6bde5e3df254d79f5",
    SpO2: "b50ea1e4216b5c88f1b8d53c5f2c4eff2993edb6",
    RR: "eb93fa330eba4cd2f4eac92d5e448dfe7f421106",
    Temp: "55488b14a4f2c1133273a3b8a897f7ee62b24ddc"
};

export type VitalDataPoint = {
    time: number;
    hr: number;
    sbp: number;
    dbp: number;
    spo2: number;
    rr: number;
    temp: number;
};

export async function fetchVitalDBData(): Promise<VitalDataPoint[]> {
    // Order matters for mapping columns if we rely on index
    const orderedKeys = ['HR', 'SBP', 'DBP', 'SpO2', 'RR', 'Temp'] as const;
    const tids = orderedKeys.map(k => CASE_1_TIDS[k]).join(',');

    const url = `https://api.vitaldb.net/${tids}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`VitalDB API Error: ${response.status}`);

        const text = await response.text();
        return parseCSV(text);
    } catch (e) {
        console.error("Failed to fetch VitalDB data", e);
        throw e;
    }
}

function parseCSV(text: string): VitalDataPoint[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    // Skip header
    const dataRows = lines.slice(1);

    return dataRows.map(row => {
        const cols = row.split(',');
        // cols[0] is Time
        // cols[1..N] are values in order of requested TIDs

        return {
            time: parseFloat(cols[0]),
            hr: parseFloat(cols[1]) || 0,
            sbp: parseFloat(cols[2]) || 0,
            dbp: parseFloat(cols[3]) || 0,
            spo2: parseFloat(cols[4]) || 0,
            rr: parseFloat(cols[5]) || 0,
            temp: parseFloat(cols[6]) || 0
        };
    }).filter(d => !isNaN(d.time)); // Filter out bad rows
}
