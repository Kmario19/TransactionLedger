import express, { Router } from 'express';
import schemaValidator from '@/middleware/schemaValidator';
import validate from '@/middleware/schemaValidator';

import create from './create';
import list from './list';
import edit from './edit';
import deleteT from './delete';

const router = Router();

router.post('/', schemaValidator(create.schema), create.controller);
router.get('/', schemaValidator(list.schema), list.controller);
router.patch('/:transactionId', validate(edit.schema), edit.controller);
router.delete('/:transactionId', validate(deleteT.schema), deleteT.controller);

export default router;
