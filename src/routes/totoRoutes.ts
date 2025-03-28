import express from 'express';
import { addTotoJob, addSkorJob } from '../controllers/totoController';

const router = express.Router()

router.post("/start-toto", addTotoJob);
router.post("/start-skor", addSkorJob);

export default router