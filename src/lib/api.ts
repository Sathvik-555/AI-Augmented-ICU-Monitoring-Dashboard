import React from 'react';

const API_BASE = 'http://localhost:3001/api';

export async function fetchPatients() {
    const res = await fetch(`${API_BASE}/patients`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
}

export async function fetchPatient(id: string) {
    const res = await fetch(`${API_BASE}/patients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch patient');
    return res.json();
}

export async function uploadHistory(patientId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/patients/${patientId}/history`, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) throw new Error('Upload failed');
    return res.json();
}

export async function fetchBeds() {
    const res = await fetch(`${API_BASE}/beds`);
    if (!res.ok) throw new Error('Failed to fetch beds');
    return res.json();
}

export async function admitPatient(bedId: string, data: any) {
    const res = await fetch(`${API_BASE}/beds/${bedId}/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Admit failed');
    return res.json();
}

export async function dischargePatient(bedId: string) {
    const res = await fetch(`${API_BASE}/beds/${bedId}/discharge`, {
        method: 'POST'
    });
    if (!res.ok) throw new Error('Discharge failed');
    return res.json();
}
