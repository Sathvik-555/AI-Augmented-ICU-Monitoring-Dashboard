import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VitalSigns } from '../lib/simulator';
import { Card } from './Card';

interface VitalsGraphProps {
    data: VitalSigns[];
}

export function VitalsGraph({ data }: VitalsGraphProps) {
    return (
        <Card title="Live Vitals Stream" className="h-96">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis domain={['auto', 'auto']} stroke="#94a3b8" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                        itemStyle={{ color: '#f1f5f9' }}
                        labelFormatter={() => ''}
                    />
                    <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={false} name="HR (bpm)" />
                    <Line type="monotone" dataKey="sbp" stroke="#3b82f6" strokeWidth={2} dot={false} name="SBP (mmHg)" />
                    <Line type="monotone" dataKey="spo2" stroke="#22c55e" strokeWidth={2} dot={false} name="SpO2 (%)" />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
}
