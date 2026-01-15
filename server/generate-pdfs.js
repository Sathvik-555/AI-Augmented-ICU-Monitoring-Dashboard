const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const patients = [
    {
        name: 'John Doe',
        filename: 'John_Doe_Medical_History.pdf',
        content: `
            PATIENT: John Doe
            AGE: 45
            GENDER: Male
            
            ADMISSION DIAGNOSIS: Community Acquired Pneumonia (Severe)
            
            PAST MEDICAL HISTORY:
            - Hypertension (diagnosed 2018)
            - Type 2 Diabetes Mellitus (controlled with Metformin)
            - Smoker (1 pack/day for 20 years, quit 2022)
            
            MEDICATIONS:
            - Lisinopril 10mg daily
            - Metformin 500mg BID
            
            ALLERGIES:
            - Penicillin (Rash)
            
            RECENT EVENTS:
            Presented to ER with high grade fever (39.5C), productive cough with rusty sputum, and shortness of breath. CXR showed right lower lobe consolidation. Admitted to ICU for respiratory monitoring. SpO2 dropped to 88% on RA, now on 4L NC.
        `
    },
    {
        name: 'Jane Smith',
        filename: 'Jane_Smith_Medical_History.pdf',
        content: `
            PATIENT: Jane Smith
            AGE: 62
            GENDER: Female
            
            ADMISSION DIAGNOSIS: Sepsis likely secondary to UTI
            
            PAST MEDICAL HISTORY:
            - Recurrent UTIs
            - Osteoporosis
            - Chronic Kidney Disease (Stage 3)
            
            MEDICATIONS:
            - Calcium + Vitamin D supplements
            - Alendronate weekly
            
            ALLERGIES:
            - Sulfa Drugs (Anaphylaxis)
            
            RECENT EVENTS:
            Confusion and lethargy noted by family. Hypotensive (BP 85/50) upon arrival. Lactate 4.2. Started on IV fluids and Broad spectrum antibiotics (Meropenem). Urine culture pending. Central line placed. Requiring low dose Norepinephrine.
        `
    },
    {
        name: 'Robert Johnson',
        filename: 'Robert_Johnson_Medical_History.pdf',
        content: `
            PATIENT: Robert Johnson
            AGE: 78
            GENDER: Male
            
            ADMISSION DIAGNOSIS: Acute Decompensated Heart Failure
            
            PAST MEDICAL HISTORY:
            - Ischemic Cardiomyopathy (EF 35%)
            - CABG x3 (2015)
            - Atrial Fibrillation
            
            MEDICATIONS:
            - Furosemide 40mg daily
            - Carvedilol 6.25mg BID
            - Apixaban 5mg BID
            
            ALLERGIES:
            - NKDA (No Known Drug Allergies)
            
            RECENT EVENTS:
            Progressive dyspnea over 3 days. Orthopnea +++. Lower limb edema extending to thighs. BNP > 5000. CXR shows pulmonary edema. Started on IV Lasix infusion. BP stable but patient is tachypneic. Monitoring for arrhythmias.
        `
    },
    {
        name: 'Emily Davis',
        filename: 'Emily_Davis_Medical_History.pdf',
        content: `
            PATIENT: Emily Davis
            AGE: 35
            GENDER: Female
            
            ADMISSION DIAGNOSIS: Acute Severe Asthma Exacerbation
            
            PAST MEDICAL HISTORY:
            - Asthma (since childhood)
            - Eczema
            - Anxiety Disorder
            
            MEDICATIONS:
            - Albuterol Inhaler PRN
            - Fluticasone/Salmeterol daily
            - Sertraline 50mg daily
            
            ALLERGIES:
            - Aspirin (Wheezing)
            - Dust Mites
            
            RECENT EVENTS:
            Sudden onset severe wheezing after exposure to neighbor's cat. Failed home neb treatments x3. ER presentation with silent chest and peak flow < 40%. Given IV Magnesium, Solu-Medrol, and continuous Albuterol nebs. Avoided intubation so far but remains high risk.
        `
    }
];

const outputDir = path.join(__dirname, '..', 'sample_records');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

patients.forEach(p => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(path.join(outputDir, p.filename)));

    doc.fontSize(20).text('Medical Record Summary', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(p.content, {
        align: 'left',
        paragraphGap: 10,
        indent: 20
    });

    doc.end();
    console.log(`Generated: ${p.filename}`);
});
