
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const patients = await prisma.patient.findMany({
        include: {
            bed: true
        }
    });
    console.log(`Found ${patients.length} patients in the database:`);
    patients.forEach(p => {
        console.log(`- ${p.name} (Bed: ${p.bed?.label}, Status: ${p.status}, Bed Status: ${p.bed?.status})`);
    });

    const beds = await prisma.bed.findMany();
    console.log(`Total beds: ${beds.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
