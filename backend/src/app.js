import express from "express";
import router from "./router.js"
import cors from "cors"
const app = express();

app.use(express.json())

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(router);
export default app;
