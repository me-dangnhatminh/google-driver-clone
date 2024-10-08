import { Logger, Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Module({
  imports: [],
  providers: [
    {
      provide: ElasticsearchService,
      useValue: new ElasticsearchService({
        node: 'http://localhost:9200',
      }),
    },
  ],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {
  private readonly logger = new Logger(ElasticsearchModule.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  onModuleInit() {
    // create index if not exists
    this.elasticsearchService.indices
      .exists({ index: ['files', 'folders', 'storages'] })
      .then((res) => {
        if (!res) {
          this.elasticsearchService.indices.create({ index: 'files' });
          this.elasticsearchService.indices.create({ index: 'folders' });
          this.elasticsearchService.indices.create({ index: 'storages' });
        }
      });
  }
}
