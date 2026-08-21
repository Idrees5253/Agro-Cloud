import { Router } from 'express'
import { getFarmers, addFarmer } from '../db/index.js'

const router = Router()

router.get('/', (req, res) => res.json(getFarmers()))

router.post('/', (req, res) => {
  const { name, village, primaryCrop, plot } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const farmer = addFarmer({ name, village, primaryCrop, plot })
  res.status(201).json(farmer)
})

export default router
