import * as aws4 from 'aws4';
import * as QS from 'querystring';
import * as XMLParser from 'fast-xml-parser';
import * as FileType from 'file-type';
import { ReadStream } from 'fs';
import * as XMLBuilder from 'xmlbuilder2';
import fetch from 'node-fetch';

import Bucket from './bucket';
import { IGetBucket, IGetService } from '../typings/response';

export type HttpMethod = 'PUT' | 'POST' | 'DELETE' | 'GET';
export type ACL = 'private' | 'public-read' | 'public-read-write' | 'authenticated-read' | 'bucket-owner-read' | 'bucket-owner-control';
export type Region = 'fr-par' | 'nl-ams' | string;

export default class Api {

	public get Bucket(): new (name: string) => Bucket {
		const self = this;
		// tslint:disable-next-line: max-classes-per-file
		return class extends Bucket {

			constructor(name: string) {
				super(self, name);
			}
		}
	}

	private _accessKey: string;

	private _secretKey: string;

	private _region: Region;

	constructor(accessKey: string, secretKey: string, region: Region) {
		this._accessKey = accessKey;
		this._secretKey = secretKey;
		this._region = region;
	}

	// #region Service API

	public async getService(): Promise<IGetService> {
		const { ListAllMyBucketsResult } = await this._request<IGetService>('GET', null, this._getPath(''));
		return {
			ListAllMyBucketsResult: {
				...ListAllMyBucketsResult,
				Buckets: {
					Bucket: ListAllMyBucketsResult.Buckets.Bucket.map(({ Name, CreationDate }) => ({
						Name,
						CreationDate: new Date(CreationDate),
					})),
				},
			},
		}
	}

	// #endregion

	// #region Bucket API

	/**
	 * Creates the bucket.
	 *
	 * @param bucket Name of the bucket.
	 */
	public async putBucket(bucket: string): Promise<void> {
		await this._request('PUT', bucket, '/');
	}

	/**
	 * Updates the visibility of the bucket.
	 *
	 * @param bucket Name of the bucket.
	 * @param acl ACL permissions of the bucket.
	 */
	public async putBucketAcl(bucket: string, acl: ACL): Promise<void> {
		await this._request('PUT', bucket, '/', { 'x-amz-acl': acl }, '', { acl: '' });
	}

	/**
	 * Enables the versioning of the bucket.
	 *
	 * @param bucket Name fo the bucket.
	 */
	public async putBucketVersioning(bucket: string): Promise<void> {
		const body = XMLBuilder.create()
			.ele('VersioningConfiguration', { xmlns: 'http://s3.amazonaws.com/doc/2006-03-01/' })
			.ele('Status').txt('Enabled')
			.end({ headless: true });
		await this._request('PUT', bucket, '/', undefined, body, { versioning: '' });
	}

	/**
	 * Gets the bucket info.
	 *
	 * @param bucket Name of the bucket.
	 */
	public async getBucket(bucket: string): Promise<IGetBucket> {
		return this._request<IGetBucket>('GET', bucket, '/');
	}

	/**
	 * Deletes the bucket.
	 *
	 * @param bucket Name of the bucket.
	 */
	public async deleteBucket(bucket: string): Promise<void> {
		await this._request('DELETE', bucket, '/');
	}

	// #endregion

	// #region Object API

	public async putObject(
		bucket: string,
		name: string,
		content: Buffer | ReadStream | string,
		dir: string = '/',
		contentType: string = 'text/plain',
		metaData: Record<string, any> = {},
		additionalParams: Record<string, any> = {},
	): Promise<void> {
		if (content instanceof Buffer) {
			const type = await FileType.fromBuffer(content);
			contentType = type?.mime || contentType;
		}
		await this._request('PUT', bucket, this._getPath(name, dir), {
			'Content-Type': contentType,
			...this._createMetaDataHeaders(metaData),
			...additionalParams
		}, content);
	}

	public async putObjectAcl(bucket: string, name: string, acl: ACL, dir: string = '/'): Promise<void> {
		await this._request('PUT', bucket, this._getPath(name, dir), { 'x-amz-acl': acl }, '', { acl: '' });
	}

	public async getObject(bucket: string, name: string, dir: string = '/'): Promise<Buffer> {
		return this._request('GET', bucket, this._getPath(name, dir), undefined, undefined, undefined, true);
	}

	public async deleteObject(bucket: string, name: string, dir: string = '/'): Promise<void> {
		await this._request('DELETE', bucket, this._getPath(name, dir));
	}

	/** @deprecated */
	public getObjectUrl(bucket: string, name: string, dir: string = '/'): string {
		return this.getPublicUrl(bucket, name, dir);
	}

	public getPublicUrl(bucket: string, name: string, dir: string = '/'): string {
		return this._getUri(bucket, name, dir);
	}

	// #endregion

	private async _request<T = any>(
		method: HttpMethod,
		bucket: string,
		path: string,
		headers?: any, // TODO types
		body?: any, // TODO types
		qs?: any, // TODO types
		forceBuffer: boolean = false,
	): Promise<T> {
		const q = QS.stringify(qs);
		if (q) {
			path = `${path}?${q}`;
		}
		const hash = this._createHash(method, bucket, path, headers);
		const r = await fetch(`https://${this._getHost(bucket)}${path}`, {
			method,
			headers: hash.headers,
			body,
		});
		const buffer = await r.buffer();
		const message = buffer.toString();
		let data;
		if (message && XMLParser.validate(message) === true) {
			try {
				data = XMLParser.parse(message);
				// tslint:disable-next-line: no-empty
			} catch (e) { }
		}
		if (r.status >= 400) {
			throw data?.Error || 'Unknown error';
		}
		if (forceBuffer) {
			return buffer as any;
		}
		return data || buffer;
	}

	private _createHash(method: HttpMethod, bucket: string, path: string, headers?: { [key: string]: string }) {
		return aws4.sign({
			service: 's3',
			region: this._region,
			method,
			path,
			host: this._getHost(bucket),
			headers,
			/*
			headers: {
				'Content-Type': 'application/octet-stream',
				'x-amz-acl': 'public-read',
			},
			*/
		}, {
			accessKeyId: this._accessKey,
			secretAccessKey: this._secretKey,
			region: this._region,
		});
	}

	private _createMetaDataHeaders(metaData: Record<string, any>): Record<string, any> {
		const keys = Object.keys(metaData);
		if (!keys.length) {
			return {};
		}
		return keys.reduce((result, key) => {
			return {
				...result,
				[`x-amz-meta-${key}`]: metaData[key],
			};
		}, {});
	}

	private _getUri(bucket: string, name: string, dir: string = '/', params: any = {}): string {
		return `https://${this._getHost(bucket)}${this._getPath(name, dir, params)}`;
	}

	private _getHost(bucket: string): string {
		if (!bucket) {
			return `s3.${this._region}.scw.cloud`;
		}
		return `${bucket}.s3.${this._region}.scw.cloud`;
	}

	private _getPath(name: string, dir: string = '/', params: any = {}): string {
		if (dir !== '/') {
			if (dir.indexOf('/') !== 0) {
				dir = `/${dir}`;
			}
			if (dir.lastIndexOf('/') !== dir.length - 1) {
				dir = `${dir}/`;
			}
		}
		if (name.indexOf('/') === 0) {
			name = name.substr(1);
		}
		const q = QS.stringify(params);
		if (q) {
			return `${dir}${encodeURIComponent(name)}?${q}`;
		}
		return `${dir}${encodeURIComponent(name)}`;
	}
}
