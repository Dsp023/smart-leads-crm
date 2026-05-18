import { Router } from 'express';
import {
  createLead,
  listLeads,
  getLeadDetails,
  updateLead,
  deleteLead,
  exportCSV,
} from '../controllers/lead.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createLeadSchema, updateLeadSchema } from '../validators/lead.validator';

const router = Router();

// All routes here are protected
router.use(requireAuth);

router.post('/', validateRequest(createLeadSchema), createLead);
router.get('/', listLeads);

// Note: must be defined before the /:id route to prevent matching 'export' as an ID
router.get('/export/csv', exportCSV);

router.get('/:id', getLeadDetails);
router.put('/:id', validateRequest(updateLeadSchema), updateLead);

// Restrict lead deletion solely to Admin role
router.delete('/:id', requireRole('Admin'), deleteLead);

export default router;
