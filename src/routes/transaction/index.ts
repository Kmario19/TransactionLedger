import schemaValidator from '@/middleware/schemaValidator';
import validate from '@/middleware/schemaValidator';
import { Router } from 'express';

import create from './create';
import deleteT from './delete';
import edit from './edit';
import list from './list';

const router = Router();

router.post('/', schemaValidator(create.schema), create.controller);
router.get('/', schemaValidator(list.schema), list.controller);
router.patch('/:transactionId', validate(edit.schema), edit.controller);
router.delete('/:transactionId', validate(deleteT.schema), deleteT.controller);

export default router;
