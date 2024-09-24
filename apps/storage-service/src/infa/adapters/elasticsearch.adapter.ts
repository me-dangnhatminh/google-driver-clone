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
    this.elasticsearchService
      .ping()
      .then((v) => {
        if (v) this.logger.log('Elasticsearch is connected');
        else this.logger.error('Elasticsearch is not connected');
      })
      .catch((err) => {
        this.logger.error('Elasticsearch is not connected', err);
        throw err;
      });
  }
}
