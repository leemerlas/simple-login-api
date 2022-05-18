import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

//Routes
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';


const app = express();
app.use(bodyParser.json({limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}))
app.use(cors());

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);


const CONNECTION_URL = "mongodb://localhost:27017/nudgyt"
const PORT = 5000;

// @route   GET /health-check
// @desc    Can be used to check if API is up and running
// @access  Public
app.get('/health-check', function (req, res) {

    var currentDate = new Date();

    var datetime = "Health check time: " + currentDate.getDate() + "/"+(currentDate.getMonth()+1) 
    + "/" + currentDate.getFullYear() + " @ " 
    + currentDate.getHours() + ":" 
    + currentDate.getMinutes() + ":" + currentDate.getSeconds();

    res.json({ 
        msg: `Server up and running on port ${PORT}!`,
        serverTime: datetime
    })
})

mongoose.connect(CONNECTION_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
.then(() => {
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
})
.catch(error => {
    console.error('Failed to connect to mongo on startup - retrying in 5 sec', error);
    setTimeout(connectWithRetry, 5000);
})

export default app;