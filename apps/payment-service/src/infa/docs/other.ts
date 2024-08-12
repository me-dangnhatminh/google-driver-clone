import { ApiOperationOptions } from '@nestjs/swagger';
import { CreatePlanDTO } from 'src/app/dtos';

const value: CreatePlanDTO = {
  name: 'Basic Plan',
  description: 'Basic plan for testing',
};

export const CreatePlanOperation: ApiOperationOptions = {
  summary: 'Create a new plan',
  description: 'Create a new plan',
  requestBody: {
    content: {
      'application/json': {
        examples: {
          basic: { value },
        },
      },
    },
  },
};

export const GetPlanByIdOperation: ApiOperationOptions = {
  summary: 'Get plan by ID',
  description: 'Get plan by ID',
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'Plan ID',
      required: true,
      schema: { type: 'string' },
    },
  ],
};
