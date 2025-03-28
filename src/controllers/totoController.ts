import { Request, Response } from "express";
import { skorQueue, totoQueue } from "../jobs/totoQueue";

const addTotoJob = async (req: Request, res: Response): Promise<void> => {
    const { toto, prizes, contenders } = req.body;

    if (!toto || !contenders) {
        res.status(400).json({ message: "Toto ve kullanıcı bilgisi gerekli" });
        return;
    }

    try {
        const job = await totoQueue.add("processToto", { toto, prizes, contenders }); // queue'ya job'ı gönder 
        res.status(200).json({ message: "Toto job sıraya eklendi", jobId: job.id });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: "jobı sıraya eklerken hata oluştu", error: error.message });
        } else {
            res.status(500).json({ message: "bilinmeyen hata" });
        }
    }
};

const addSkorJob = async (req: Request, res: Response): Promise<void> => {
    const { match, prize, winners} = req.body

    if (!match || !winners) {
        res.status(400).json({ message: "match winners bilgisi gerekli" });
        return;
    }
    try{
        const job = await skorQueue.add("processSkor", { match, prize, winners });
        res.status(200).json({ message: "Toto job sıraya eklendi", jobId: job.id });

    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: "jobı sıraya eklerken hata oluştu", error: error.message });
        } else {
            res.status(500).json({ message: "bilinmeyen hata" });
        }
    }
}

export { addSkorJob };
export { addTotoJob };