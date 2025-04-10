"use strict";
// Root route handler
app.get('/', (req, res) => {
    res.json({
        message: 'Test Genie API is running',
        status: 'healthy',
        version: '1.0.0'
    });
});
// API routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);
