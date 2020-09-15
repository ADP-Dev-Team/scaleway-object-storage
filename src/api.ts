import * as aws4 from 'aws4';
import * as request from 'request';
import * as QS from 'querystring';
import * as FileType from 'file-type';
import * as XMLParser from 'fast-xml-parser';

import { IGetBucket, IGetService } from '../typings/response';

export type HttpMethod = 'PUT' | 'POST' | 'DELETE' | 'GET';
export type ACL = 'private' | 'public-read' | 'public-read-write' | 'authenticated-read' | 'bucket-owner-read' | 'bucket-owner-control';
export type Region = 'fr-par' | 'nl-ams' | string;

export default class Api {

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

	public async putBucket(bucket: string): Promise<void> {
		await this._request('PUT', bucket, '/');
	}

	public async putBucketAcl(bucket: string, acl: ACL): Promise<void> {
		await this._request('PUT', bucket, '/', { 'x-amz-acl': acl }, '', { acl: '' });
	}

	public async getBucket(bucket: string): Promise<IGetBucket> {
		return this._request<IGetBucket>('GET', bucket, '/');
	}

	public async deleteBucket(bucket: string): Promise<void> {
		await this._request('DELETE', bucket, '/');
	}

	// #endregion

	// #region Object API

	public async putObject(bucket: string, name: string, content: Buffer | string, dir: string = '/'): Promise<void> {
		let contentType: string = 'text/plain';
		if (content instanceof Buffer) {
			const type = await FileType.fromBuffer(content);
			contentType = type?.mime;
		}
		await this._request('PUT', bucket, this._getPath(name, dir), {
			'Content-Type': contentType,
		}, content);
	}

	public async putObjectAcl(bucket: string, name: string, acl: ACL, dir: string = '/'): Promise<void> {
		await this._request('PUT', bucket, this._getPath(name, dir), { 'x-amz-acl': acl }, '', { acl: '' });
	}

	public async getObject(bucket: string, name: string, dir: string = '/'): Promise<string> {
		return this._request('GET', bucket, this._getPath(name, dir));
	}

	public async deleteObject(bucket: string, name: string, dir: string = '/'): Promise<void> {
		const hash = this._createHash('DELETE', bucket, this._getPath(name, dir));
		await this._request('DELETE', bucket, this._getPath(name, dir), hash.headers);
	}

	public getObjectUrl(bucket: string, name: string, dir: string = '/'): string {
		return this._getUri(bucket, name, dir);
	}

	// #endregion

	private _request<T = any>(
		method: HttpMethod,
		bucket: string,
		path: string,
		headers?: any, // TODO types
		body?: any, // TODO types
		qs?: any, // TODO types
	): Promise<T> {
		const q = QS.stringify(qs);
		const hash = this._createHash(method, bucket, !q ? path : `${path}?${q}`, headers);
		return new Promise((resolve, reject) => {
			request({
				uri: `https://${this._getHost(bucket)}${path}`,
				method,
				headers: hash.headers,
				body,
				qs,
			}, (err, res, message) => {
				if (err) {
					reject(err);
					return;
				}
				let data;
				if (message) {
					try {
						data = XMLParser.parse(message);
						// tslint:disable-next-line: no-empty
					} catch (e) { }
				}
				if (res.statusCode >= 400) {
					reject(data?.Error || 'Unknown error');
					return;
				}
				resolve(data || message);
			});
		});
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