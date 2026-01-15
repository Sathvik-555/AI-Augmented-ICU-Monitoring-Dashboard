import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Clean up
    await prisma.medicalRecord.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.bed.deleteMany();

    // Create Beds
    const beds = [];
    for (let i = 1; i <= 6; i++) {
        beds.push(await prisma.bed.create({
            data: {
                label: `BED 0${i}`,
                status: 'VACANT'
            }
        }));
    }

    // Create Patients
    const patientsData = [
        { name: 'John Doe', age: 45, gender: 'Male', condition: 'Pneumonia', bedIndex: 0, scenario: 'NORMAL' },
        { name: 'Jane Smith', age: 62, gender: 'Female', condition: 'Sepsis', bedIndex: 1, scenario: 'SEPSIS' },
        { name: 'Robert Johnson', age: 78, gender: 'Male', condition: 'Heart Failure', bedIndex: 2, scenario: 'CARDIAC_INSTABILITY' },
        { name: 'Emily Davis', age: 35, gender: 'Female', condition: 'Asthma Exacerbation', bedIndex: 3, scenario: 'RESPIRATORY_DISTRESS' },
    ];

    for (const p of patientsData) {
        const bed = beds[p.bedIndex];
        if (!bed) continue; // Safety check

        await prisma.patient.create({
            data: {
                name: p.name,
                age: p.age,
                gender: p.gender,
                condition: p.condition,
                bed: {
                    connect: { id: bed.id }
                }
            }
        });

        // Update bed status
        await prisma.bed.update({
            where: { id: bed.id },
            data: { status: 'OCCUPIED' }
        });
    }

    console.log('Seed completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
