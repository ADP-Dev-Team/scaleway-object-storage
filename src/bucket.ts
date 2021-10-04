import { ReadStream } from 'fs';
import { IBucket } from '../typings/model';
import { IGetBucket } from '../typings/response';
import Api, { ACL } from './api';

export default class Bucket {

	private _api: Api;

	private _name: string;

	constructor(api: Api, name: string) {
		this._api = api;
		this._name = name;
	}

	// #region Bucket API

	public async create(): Promise<void> {
		await this._api.putBucket(this._name);
	}

	public async setVisibility(visibility: ACL): Promise<void> {
		await this._api.putBucketAcl(this._name, visibility);
	}

	public async enableVersioning(): Promise<void> {
		await this._api.putBucketVersioning(this._name);
	}

	public async get(): Promise<IGetBucket> {
		return this._api.getBucket(this._name);
	}

	public async delete(): Promise<void> {
		await this._api.deleteBucket(this._name);
	}

	// #endregion

	// #region Object API

	public async putObject(
		name: string,
		content: Buffer | ReadStream | string,
		dir: string = '/',
		contentType: string = 'text/plain',
		metaData: Record<string, any> = {},
		additionalParams: Record<string, any> = {},
	): Promise<void> {
		await this._api.putObject(this._name, name, content, dir, contentType, metaData, additionalParams);
	}

	public async putObjectAcl(name: string, acl: ACL, dir: string = '/'): Promise<void> {
		await this._api.putObjectAcl(this._name, name, acl, dir);
	}

	public async getObject(name: string, dir: string = '/'): Promise<Buffer> {
		return this._api.getObject(this._name, name, dir);
	}

	public async deleteObject(name: string, dir: string = '/'): Promise<void> {
		await this._api.deleteObject(this._name, name, dir);
	}

	public getObjectUrl(name: string, dir: string = '/'): string {
		return this._api.getPublicUrl(this._name, name, dir);
	}

	// #endregion
}
