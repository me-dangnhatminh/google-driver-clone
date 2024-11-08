/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import { Transactional } from '@nestjs-cls/transactional';

import {
  ContentFolderQuery,
  GetFolderQuery,
  ListFolderQuery,
} from 'src/app/queries';

import {
  CreateFolderCommand,
  DeleteFolderCommand,
  UpdateFolderCommand,
  AddContentFolderCommand,
} from 'src/app/commands/v2';

const SERVICE_NAME = 'FolderService';
@Controller()
export class FolderGrpcController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @GrpcMethod(SERVICE_NAME, 'get')
  async get(request, metadata) {
    const query = new GetFolderQuery(request, metadata);
    return await this.queryBus.execute(query);
  }

  @GrpcMethod(SERVICE_NAME, 'getContent')
  async getContent(request, metadata) {
    const query = new ContentFolderQuery(request, metadata);
    return await this.queryBus.execute(query);
  }

  @GrpcMethod(SERVICE_NAME, 'list')
  async list(request, metadata) {
    const query = new ListFolderQuery(request, metadata);
    return await this.queryBus.execute(query);
  }

  @GrpcMethod(SERVICE_NAME, 'create')
  async createFolder(request, metadata) {
    const command = new CreateFolderCommand(request, metadata);
    return await this.commandBus.execute(command);
  }

  @GrpcMethod(SERVICE_NAME, 'update')
  @Transactional()
  async updateFolder(request, metadata) {
    const command = new UpdateFolderCommand(request, metadata);
    await this.commandBus.execute(command);
    return command.input;
  }

  @GrpcMethod(SERVICE_NAME, 'delete')
  @Transactional()
  async deleteFolder(request, metadata) {
    const command = new DeleteFolderCommand(request, metadata);
    await this.commandBus.execute(command);
    return command.input;
  }

  @GrpcMethod(SERVICE_NAME, 'addContent')
  @Transactional()
  async addContent(request, metadata) {
    const command = new AddContentFolderCommand(request, metadata);
    const result = await this.commandBus.execute(command);
    return result;
  }
}
