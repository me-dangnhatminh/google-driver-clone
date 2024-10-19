import { FileRef, Folder, Storage } from '@prisma/client';
import { FileModel, FolderModel, StorageModel } from 'src/domain';

type FolderExtend = Pick<Folder, 'rootId' | 'depth' | 'lft' | 'rgt'>;

export class OrmFolder {
  protected _domain: FolderModel;
  protected _orm: Folder;

  constructor(domain: FolderModel | FolderModel['props'], orm: Folder) {
    this._domain = new FolderModel(domain);
    this._orm = orm;
  }

  get orm() {
    return this._orm;
  }

  get domain() {
    return this._domain;
  }

  static fromDomain(
    domain: FolderModel | FolderModel['props'],
    extension: FolderExtend,
  ) {
    let props: FolderModel['props'];
    if (domain instanceof FolderModel) {
      props = domain.props;
    } else {
      props = domain;
    }
    const orm: Folder = {
      ...props,
      ...extension,
      size: BigInt(props.size),
      createdAt: new Date(props.createdAt),
      modifiedAt: new Date(props.modifiedAt),
      archivedAt: props.archivedAt ? new Date(props.archivedAt) : null,
      pinnedAt: props.pinnedAt ? new Date(props.pinnedAt) : null,
    };
    return new OrmFolder(domain, orm);
  }

  static fromOrm(orm: Folder) {
    return new OrmFolder(
      {
        ...orm,
        size: Number(orm.size),
        createdAt: orm.createdAt.toISOString(),
        modifiedAt: orm.modifiedAt.toISOString(),
        archivedAt: orm.archivedAt?.toISOString() || null,
        pinnedAt: orm.pinnedAt?.toISOString() || null,
      },
      orm,
    );
  }

  toOrm(extension: FolderExtend): Folder {
    const domain = this.domain.props;
    return {
      ...domain,
      ...extension,
      size: BigInt(domain.size),
      createdAt: new Date(domain.createdAt),
      modifiedAt: new Date(domain.modifiedAt),
      archivedAt: domain.archivedAt ? new Date(domain.archivedAt) : null,
      pinnedAt: domain.pinnedAt ? new Date(domain.pinnedAt) : null,
    };
  }
}

export class OrmFile extends FileModel {
  toOrm(): FileRef {
    return {
      ...this._props,
      size: BigInt(this._props.size),
      createdAt: new Date(this._props.createdAt),
      modifiedAt: new Date(this._props.modifiedAt),
      archivedAt: this._props.archivedAt
        ? new Date(this._props.archivedAt)
        : null,
      pinnedAt: this._props.pinnedAt ? new Date(this._props.pinnedAt) : null,
    };
  }
}

export class OrmStorage {
  protected _domain: StorageModel;
  constructor(domain: StorageModel) {
    this._domain = domain;
  }

  static fromDomain(domain: StorageModel) {
    return new OrmStorage(domain);
  }

  get domain() {
    return this._domain;
  }

  get props() {
    return this.domain.props;
  }

  toOrm(): Storage {
    return {
      ...this.props,
      metadata: this.props.metadata || {},
      used: BigInt(this.props.used),
      total: BigInt(0),
      createdAt: new Date(this.props.createdAt),
      modifiedAt: new Date(this.props.modifiedAt),
      archivedAt: this.props.archivedAt
        ? new Date(this.props.archivedAt)
        : null,
    };
  }
}
