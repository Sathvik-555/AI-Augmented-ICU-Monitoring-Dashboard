import express from 'express';
import cors from 'cors';
import patientRoutes from './routes/patients';
import uploadRoutes from './routes/upload';
import bedRoutes from './routes/beds';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/patients', uploadRoutes); // Mount at same prefix but logic handles /:id/history
app.use('/api/beds', bedRoutes); // New Bed Management Route
app.use('/api/ai', aiRoutes); // New AI Route

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.send('ICU Dashboard API is running. Access the frontend at http://localhost:5173');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
