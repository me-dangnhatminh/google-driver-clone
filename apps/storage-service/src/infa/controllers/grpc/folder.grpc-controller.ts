/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';

import {
  ContentFolderQuery,
  GetFolderQuery,
  ListFolderQuery,
} from 'src/app/queries';

import {
  CreateFolderCommand,
  DeleteFolderCommand,
  UpdateFolderCommand,
} from 'src/app/commands/v2';

const SERVICE_NAME = 'StorageService';

@Controller()
export class FolderGrpcController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @GrpcMethod(SERVICE_NAME, 'getFolder')
  async get(request, metadata) {
    const query = new GetFolderQuery(request, metadata);
    return await this.queryBus.execute(query);
  }

  @GrpcMethod(SERVICE_NAME, 'getFolderContent')
  async getContent(request, metadata) {
    const query = new ContentFolderQuery(request, metadata);
    return await this.queryBus.execute(query);
  }

  @GrpcMethod(SERVICE_NAME, 'listFolder')
  async list(request, metadata) {
    const query = new ListFolderQuery(request, metadata);
    return await this.queryBus.execute(query);
  }

  @GrpcMethod(SERVICE_NAME, 'createFolder')
  async createFolder(request, metadata) {
    const command = new CreateFolderCommand(request, metadata);
    return await this.commandBus.execute(command);
  }

  @GrpcMethod(SERVICE_NAME, 'updateFolder')
  async updateFolder(request, metadata) {
    const command = new UpdateFolderCommand(request, metadata);
    await this.commandBus.execute(command);
    return command.input;
  }

  @GrpcMethod(SERVICE_NAME, 'deleteFolder')
  async deleteFolder(request, metadata) {
    const command = new DeleteFolderCommand(request, metadata);
    await this.commandBus.execute(command);
    return command.input;
  }

  @GrpcMethod(SERVICE_NAME, 'copyFolder')
  async copyFolder(request, metadata) {
    throw new Error('Not implemented');
  }

  @GrpcMethod(SERVICE_NAME, 'moveFolder')
  async moveFolder(request, metadata) {
    throw new Error('Not implemented');
  }
}
