import express from "express";
import router from "./router.js"
import cors from "cors"
const app = express();

app.use(express.json())

process.on('warning', (warning) => {
    if (warning.name === 'Warning' && warning.message.includes('TT: undefined function: 32')) {
      return;
    }
    console.warn(warning.name, warning.message, warning.stack);
  });
  

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(router);
export default app;
