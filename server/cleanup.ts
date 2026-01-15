
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log("Looking for placeholder records...");
    const deleted = await prisma.medicalRecord.deleteMany({
        where: {
            summary: {
                contains: 'Placeholder'
            }
        }
    });
    console.log(`Deleted ${deleted.count} placeholder records.`);

    // Recalculate contexts for all patients
    const patients = await prisma.patient.findMany();
    for (const p of patients) {
        const history = await prisma.medicalRecord.findMany({
            where: { patientId: p.id }
        });
        const combined = history.map(h => h.summary).join('\n---\n');
        await prisma.patient.update({
            where: { id: p.id },
            data: { patientContextSummary: combined || null }
        });
        console.log(`Updated context for patient ${p.id}`);
    }
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
