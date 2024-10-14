import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('folder')
@ApiBearerAuth()
@Controller({ path: 'storage/folder', version: '1' })
export class FolderRestController {
  constructor(@Inject('FolderService') private readonly folderService) {}

  @ApiQuery({
    name: 'filter',
    required: false,
    type: 'object',
    style: 'deepObject',
    explode: false,
    allowReserved: true,
    description: `Filter conditions as an object (e.g., filter[name]=minh&filter[age]=gt:12)`,
    examples: {
      default: { value: {} },
      example_1: { value: { name: 'minh' } },
      example_2: { value: { age: 'gt:12', meta: { key: 'gt:12' } } },
    },
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    isArray: true,
    type: String,
    style: 'form',
    explode: false,
    allowReserved: true,
    description: `Sorting conditions (e.g., sort=name:asc,age:desc)`,
    examples: {
      default: { value: [] },
      example_1: { value: ['name:asc'] },
    },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit for pagination (e.g., limit=10)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset for pagination (e.g., offset=10)',
  })
  @Get()
  async list(
    @Query('filter') filter?: Record<string, any>,
    @Query('sort') sort?: Record<string, string>,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const result = await this.folderService
      .list({
        filter,
        sort,
        limit,
        offset,
      })
      .toPromise();
    return result;
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const { items } = await this.folderService
      .list({ filter: { id } })
      .toPromise();
    const folder = items[0];
    if (!folder) {
      throw new BadRequestException(`Folder with id ${id} not found`);
    }
    return folder;
  }

  @ApiQuery({
    name: 'filter',
    required: false,
    type: 'object',
    style: 'deepObject',
    explode: false,
    allowReserved: true,
    description: `Filter conditions as an object (e.g., filter[name]=minh&filter[age]=gt:12)`,
    examples: {
      default: { value: {} },
      example_1: { value: { name: 'minh' } },
      example_2: { value: { age: 'gt:12', meta: { key: 'gt:12' } } },
    },
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    isArray: true,
    type: String,
    style: 'form',
    explode: false,
    allowReserved: true,
    description: `Sorting conditions (e.g., sort=name:asc,age:desc)`,
    examples: {
      default: { value: [] },
      example_1: { value: ['name:asc'] },
    },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit for pagination (e.g., limit=10)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset for pagination (e.g., offset=10)',
  })
  @Get(':id/content')
  async getContent(
    @Param('id') id: string,
    @Query('filter') filter?: Record<string, any>,
    @Query('sort') sort?: Record<string, string>,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const result = await this.folderService
      .getContent({
        id,
        filter,
        sort,
        limit,
        offset,
      })
      .toPromise();
    return result;
  }

  @Post(':id/content\\:\\upload')
  async upload() {
    throw new Error('Not implemented');
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        ownerId: { type: 'string' },
        parentId: { type: 'string' },
      },
      required: ['name'],
    },
  })
  @Post()
  async create(@Body() body, @Res({ passthrough: true }) res) {
    const result = await this.folderService.create(body).toPromise();
    res.status(201);
    return result;
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        ownerId: { type: 'string' },
        parentId: { type: 'string' },
      },
    },
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body,
    @Res({ passthrough: true }) res,
  ) {
    const { items } = await this.folderService
      .list({ filter: { id }, limit: 1 })
      .toPromise();
    const folder = items[0];

    if (!folder) {
      throw new BadRequestException(`Folder with id ${id} not found`);
    }
    const result = await this.folderService.update({ id, ...body }).toPromise();

    if (folder.modifiedAt !== result.modifiedAt) res.status(200);
    else res.status(204);
    return result;
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        ownerId: { type: 'string' },
        parentId: { type: 'string' },
      },
    },
  })
  @Put(':id')
  async upsert(
    @Param('id') id: string,
    @Body() body,
    @Res({ passthrough: true }) res,
  ) {
    const { items } = await this.folderService
      .list({ filter: { id }, limit: 1 })
      .toPromise();
    const folder = items[0];
    if (folder) return this.update(id, body, res);
    return this.create(body, res);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res({ passthrough: true }) res) {
    const { items } = await this.folderService
      .list({ filter: { id }, limit: 1 })
      .toPromise();
    if (items.length === 0) {
      res.status(204);
      return;
    }
    const result = await this.folderService.delete({ id }).toPromise();
    res.status(200);
    return result;
  }

  // @Post(':id/action:copy')
  // @Post(':id/action:move')
}

// @Get(':id/children')
// async getChildren(@Query('id') id: string) {
//   return { id };
// }

// @Get(':id/parents')
// async getParents(@Query('id') id: string) {
//   return { id };
// }

// @Get(':id/ancestors')
// async getAncestors(@Query('id') id: string) {
//   return { id };
// }

// @Get(':id/descendants')
// async getDescendants(@Query('id') id: string) {
//   return { id };
// }
