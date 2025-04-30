import express from "express"
import { Request, Response } from "express"
import cors from "cors"
import { messages } from "./messages"

const app = express()
const PORT = 3001

app.use(cors())

app.get("/messages", (req: Request, res: Response) => {
    res.json(messages)
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})