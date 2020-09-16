import { expect } from 'chai';
import { promises as fs, readFileSync } from 'fs';
import * as path from 'path';
import * as request from 'request';

import Api from '../src';

const credentials = JSON.parse(readFileSync(path.resolve('./credentials.json')).toString());

const BUCKET = 'static01';

const storage = new Api(credentials.accessKey, credentials.secretKey, 'fr-par');

describe('Api', () => {

	it('.getService', async () => {
		// TODO
	});

	describe('Bucket', () => {

		it('.putBucket', async () => {
			await storage.putBucket('test-api');
		});

		it('.getBucket', async () => {
			const bucket = await storage.getBucket('test-api');
			expect(bucket).to.have.all.keys('ListBucketResult');
			const { ListBucketResult } = bucket;
			expect(ListBucketResult).to.have.all.keys('Name', 'Prefix', 'Marker', 'MaxKeys', 'IsTruncated');
			expect(ListBucketResult.Name).to.be.equal('test-api');
			expect(ListBucketResult.Prefix).to.be.equal('');
			expect(ListBucketResult.Marker).to.be.equal('');
			expect(ListBucketResult.MaxKeys).to.be.equal(1000);
			expect(ListBucketResult.IsTruncated).to.be.equal(false);
		});

		it('.putBucketAcl', async () => {
			await storage.putBucketAcl('test-api', 'public-read');
		});

		it('.putBucketVersioning', async () => {
			await storage.putBucketVersioning('test-api');
		});

		it('.deleteBucket', async () => {
			await storage.deleteBucket('test-api');
		});
	});

	describe('Object', () => {

		it('.putObject', async () => {
			await storage.putObject(BUCKET, 'test.txt', 'TEST');
			await storage.putObject(BUCKET, 'test.png', await fs.readFile(path.resolve(__dirname, './assets/logo.png')), 'test');
		});

		it('.getObject', async () => {
			const text: Buffer = await storage.getObject(BUCKET, 'test.txt');
			expect(text).to.be.an.instanceOf(Buffer);
			expect(text.toString()).to.be.equal('TEST');
			const image: Buffer = await storage.getObject(BUCKET, 'test.png', 'test');
			const file: Buffer = await fs.readFile(path.resolve(__dirname, './assets/logo.png'));
			expect(image).to.be.an.instanceOf(Buffer);
			// await fs.writeFile('./test.png', image);
			expect(file.byteLength).to.be.equal(image.byteLength);
		});

		it('.putObjectAcl', async () => {
			await storage.putObjectAcl(BUCKET, 'test.txt', 'public-read');
			await storage.putObjectAcl(BUCKET, 'test.png', 'public-read', 'test');
		});

		it('checks if the text file have public access', (done) => {
			request({
				method: 'HEAD',
				url: storage.getObjectUrl(BUCKET, 'test.txt'),
			}, (err, res) => {
				expect(res.statusCode).to.be.equal(200);
				done(err);
			});
		});

		it('checks if the image file have public access', (done) => {
			request({
				method: 'HEAD',
				url: storage.getObjectUrl(BUCKET, 'test.png', 'test'),
			}, (err, res) => {
				expect(res.statusCode).to.be.equal(200);
				done(err);
			});
		});

		it('.deleteObject', async () => {
			await storage.deleteObject(BUCKET, 'test.txt');
			await storage.deleteObject(BUCKET, 'test.png', 'test');
		});

		it('checks if the text file does not have public access', (done) => {
			request({
				method: 'HEAD',
				url: storage.getObjectUrl(BUCKET, 'test.txt'),
			}, (err, res) => {
				expect(res.statusCode).to.be.equal(404);
				done(err);
			});
		});

		it('checks if the image file does not have public access', (done) => {
			request({
				method: 'HEAD',
				url: storage.getObjectUrl(BUCKET, 'test.png', 'test'),
			}, (err, res) => {
				expect(res.statusCode).to.be.equal(404);
				done(err);
			});
		});
	});

});
