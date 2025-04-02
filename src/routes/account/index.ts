import express from 'express';
import schemaValidator from '@/middleware/schemaValidator';

import create from './create';
import debit from './debit';
import credit from './credit';

const router = express.Router();

router.post('/', schemaValidator(create.schema), create.controller);
router.post('/:accountId/debit', schemaValidator(debit.schema), debit.controller);
router.post('/:accountId/credit', schemaValidator(credit.schema), credit.controller);

export default router;
