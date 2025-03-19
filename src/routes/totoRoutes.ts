import express from 'express';
import { addTotoJob } from '../controllers/totoController';

const router = express.Router()

router.post("/start-toto", addTotoJob);

export default router