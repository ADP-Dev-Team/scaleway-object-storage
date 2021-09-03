import { expect } from 'chai';
import { promises as fs, readFileSync, createReadStream } from 'fs';
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
		}).timeout(5000);

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
			await storage.putObject(BUCKET, 'test.txt', 'TEST', undefined, undefined, { test: 'test' });
			await storage.putObject(BUCKET, 'test.png', await fs.readFile(path.resolve(__dirname, './assets/logo.png')), 'test');
			await storage.putObject(BUCKET, 'test-stream.png', createReadStream(path.resolve(__dirname, './assets/logo.png')), 'test');
			await storage.putObject(BUCKET, 'test.xml', createReadStream(path.resolve(__dirname, './assets/test.xml')), 'test');
		}).timeout(10000);

		it('.getObject', async () => {
			const text: Buffer = await storage.getObject(BUCKET, 'test.txt');
			expect(text).to.be.an.instanceOf(Buffer);
			expect(text.toString()).to.be.equal('TEST');
			const image: Buffer = await storage.getObject(BUCKET, 'test.png', 'test');
			const file: Buffer = await fs.readFile(path.resolve(__dirname, './assets/logo.png'));
			expect(image).to.be.an.instanceOf(Buffer);
			// await fs.writeFile('./test.png', image);
			expect(file.byteLength).to.be.equal(image.byteLength);

			const xml: Buffer = await storage.getObject(BUCKET, 'test.xml', 'test');
			const xmlFile: Buffer = await fs.readFile(path.resolve(__dirname, './assets/test.xml'));
			expect(xml).to.be.an.instanceOf(Buffer);
			expect(xmlFile.byteLength).to.be.equal(xml.byteLength);
			expect(xmlFile.toString()).to.be.equal(xml.toString());
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
			await storage.deleteObject(BUCKET, 'test-stream.png', 'test');
			await storage.deleteObject(BUCKET, 'test.xml', 'test');
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

describe('Helpers', () => {

	describe('Bucket', () => {

		const bucket = new storage.Bucket('api-test-bucket-helper');

		it('.create', async () => {
			await bucket.create();
		});

		it('.delete', async () => {
			await bucket.delete();
		});
	});
});