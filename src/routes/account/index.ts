import express from 'express';
import schemaValidator from '@/middleware/schemaValidator';

import create from './create';
import credit from './credit';
import debit from './debit';
import deleteA from './delete';
import edit from './edit';
import list from './list';

const router = express.Router();

router.post('/', schemaValidator(create.schema), create.controller);
router.post('/:accountId/debit', schemaValidator(debit.schema), debit.controller);
router.post('/:accountId/credit', schemaValidator(credit.schema), credit.controller);
router.put('/:accountId', schemaValidator(edit.schema), edit.controller);
router.delete('/:accountId', schemaValidator(deleteA.schema), deleteA.controller);
router.get('/', schemaValidator(list.schema), list.controller);

export default router;
