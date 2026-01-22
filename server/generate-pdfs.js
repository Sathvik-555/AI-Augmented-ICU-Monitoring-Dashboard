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
            
            ADMISSION DIAGNOSIS: Traumatic Brain Injury & Femur Fracture
            
            PAST MEDICAL HISTORY:
            - Hypertension (diagnosed 2018)
            - Type 2 Diabetes Mellitus
            - Smoker
            
            MEDICATIONS:
            - Lisinopril 10mg daily
            - Metformin 500mg BID
            
            ALLERGIES:
            - Penicillin (Rash)
            
            RECENT EVENTS:
            Involved in a motor vehicle accident (MVA). GCS 13 at scene, dropped to 10 in ER. CT Head shows small subdural hematoma (Head/Neuro). Patient complains of severe headache and dizziness. 
            Right leg (Limb) shows open femur fracture, external fixation applied. 
            Observation for neurological deterioration (seizures).
        `
    },
    {
        name: 'Jane Smith',
        filename: 'Jane_Smith_Medical_History.pdf',
        content: `
            PATIENT: Jane Smith
            AGE: 62
            GENDER: Female
            
            ADMISSION DIAGNOSIS: Acute Pancreatitis & Sepsis
            
            PAST MEDICAL HISTORY:
            - Gallstones (Cholelithiasis)
            - Osteoporosis
            - CKD Stage 3
            
            MEDICATIONS:
            - Creon
            - Alendronate
            
            ALLERGIES:
            - Sulfa Drugs
            
            RECENT EVENTS:
            Severe epigastric abdominal pain radiating to back (Abdomen). Nausea and vomiting x5. Lipase > 3000. CT Abdomen confirms necrotizing pancreatitis.
            On IV Fluids. Hypotensive responsive to fluids.
            Complains of generalized weakness in limbs due to hypocalcemia (Limbs/Neuro).
        `
    },
    {
        name: 'Robert Johnson',
        filename: 'Robert_Johnson_Medical_History.pdf',
        content: `
            PATIENT: Robert Johnson
            AGE: 78
            GENDER: Male
            
            ADMISSION DIAGNOSIS: Acute Decompensated Heart Failure & Gout
            
            PAST MEDICAL HISTORY:
            - Ischemic Cardiomyopathy (EF 35%)
            - Gouty Arthritis
            
            MEDICATIONS:
            - Lasix
            - Allopurinol
            
            ALLERGIES:
            - NKDA
            
            RECENT EVENTS:
            Presented with shortness of breath (Chest) and orthopnea. Bilateral pitting edema in legs extending to knees (Limbs). 
            Right big toe is swollen, red, and tender (Gout/Limbs).
            BNP elevated. Started on diuretics. Monitoring renal function (Abdomen/Renal).
        `
    },
    {
        name: 'Emily Davis',
        filename: 'Emily_Davis_Medical_History.pdf',
        content: `
            PATIENT: Emily Davis
            AGE: 35
            GENDER: Female
            
            ADMISSION DIAGNOSIS: Severe Asthma & Migraine
            
            PAST MEDICAL HISTORY:
            - Asthma
            - Chronic Migraines
            - Anxiety
            
            MEDICATIONS:
            - Albuterol
            - Sumatriptan
            
            ALLERGIES:
            - Aspirin
            
            RECENT EVENTS:
            Exacerbation of asthma with severe wheezing (Chest). SpO2 92% on room air.
            Concurrent severe migraine episode with photophobia and nausea (Head).
            Patient reports tingling sensation in fingers (Limbs/Neuro) likely due to hyperventilation.
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
