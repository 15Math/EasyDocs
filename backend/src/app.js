import express from "express";
import router from "./router.js"
import cors from "cors"
const app = express();


app.use(express.json())
app.use(cors({
    origin: 'https://easydocs15.netlify.app'
}));
app.use(router);
export default app;
