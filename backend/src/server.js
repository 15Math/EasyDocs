import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()

const PORT = process.env.PORT || 3333;
app.listen(PORT,()=>console.log('Server running on port:' + PORT))

export default app; 