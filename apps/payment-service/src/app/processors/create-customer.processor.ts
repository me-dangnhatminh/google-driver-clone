import Stripe from 'stripe';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('CustomerQueue')
export class CreateCustomerProcessor extends WorkerHost {
  private readonly logger = new Logger(CreateCustomerProcessor.name);
  constructor(private readonly stripe: Stripe) {
    super();
  }
  async process(job: Job): Promise<any> {
    this.logger.log('Processing job ' + job.id);
    if (typeof job.progress !== 'function') {
      throw new Error('job.progress is not a function');
    }
    console.log('job_name', job);
    job.progress(100);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return job.data;
  }
}
export default CreateCustomerProcessor;
