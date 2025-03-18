import express from "express"
import dotenv from "dotenv"
import totoRouter from "./routes/totoRoutes"

dotenv.config()

const app = express()

// json verilerini al
app.use(express.json())


// api rotaları dahil et
app.use("/toto", totoRouter)


const PORT = process.env.PORT || 5000

// serverı başlat
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda başlatıldı.`)
})