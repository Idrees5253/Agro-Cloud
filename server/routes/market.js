import { Router } from 'express'
import { getMandiTrend, getMandiComparison, getBuyers, getHarvestWindow } from '../db/index.js'

const router = Router()

router.get('/trend', (req, res) => res.json(getMandiTrend()))
router.get('/comparison', (req, res) => res.json(getMandiComparison()))
router.get('/buyers', (req, res) => res.json(getBuyers()))
router.get('/harvest-window', (req, res) => res.json(getHarvestWindow()))

export default router
