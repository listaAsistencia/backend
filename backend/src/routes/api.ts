import {Router} from 'express'

const router = Router();
router.get('/', (_req, res) =>{
res.json({message:"Hola /api"})
});

export default router;