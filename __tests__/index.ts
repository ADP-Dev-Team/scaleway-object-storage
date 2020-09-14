import { expect } from 'chai';
import { promises as fs, readFileSync } from 'fs';
import * as path from 'path';
import * as request from 'request';

import Api from '../src';

const credentials = JSON.parse(readFileSync(path.resolve('./credentials.json')).toString());

const ACCESS_KEY = credentials.accessKey;
const SECRET = credentials.secretKey;
const REGION = 'fr-par';
const BUCKET = 'static01';

const storage = new Api(ACCESS_KEY, SECRET, REGION);

describe('Api', () => {

	it('.getObjectUrl', () => {
		expect(storage.getObjectUrl('static01', 'test.png')).to.be.equal('https://static01.s3.fr-par.scw.cloud/test.png');
		expect(storage.getObjectUrl('static01', '/test.png')).to.be.equal('https://static01.s3.fr-par.scw.cloud/test.png');
		expect(storage.getObjectUrl('static01', 'test.png', '/test')).to.be.equal('https://static01.s3.fr-par.scw.cloud/test/test.png');
		expect(storage.getObjectUrl('static01', 'test.png', 'test')).to.be.equal('https://static01.s3.fr-par.scw.cloud/test/test.png');
		expect(storage.getObjectUrl('static01', 'test.png', 'test/')).to.be.equal('https://static01.s3.fr-par.scw.cloud/test/test.png');
		expect(storage.getObjectUrl('static01', '/test.png', 'test/')).to.be.equal('https://static01.s3.fr-par.scw.cloud/test/test.png');
		// expect(storage.getObjectUrl('static01', 'test/test.png')).to.be.equal('https://static01.s3.fr-par.scw.cloud/test/test.png');
	});

	it('.getService', async () => {
		// TODO
	});

	it('.putObject', async () => {
		await storage.putObject(BUCKET, 'test.txt', 'TEST');
		await storage.putObject(BUCKET, 'test.png', await fs.readFile(path.resolve(__dirname, './assets/logo.png')), 'test');
	});

	it('.getObject', async () => {
		const text: string = await storage.getObject(BUCKET, 'test.txt');
		expect(text).to.be.equal('TEST');
		const image: string = await storage.getObject(BUCKET, 'test.png', 'test');
		// const file: Buffer = await fs.readFile(path.resolve(__dirname, './assets/logo.png'));
		// expect(image).to.be.an.instanceOf(Buffer);
		// await fs.writeFile('./test.png', image);
		// expect(file.byteLength).to.be.equal(image.length);
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

/*
(async () => {
	try {
		console.log(storage.getObjectUrl('static01', 'test.png'));
		console.log(await storage.getService());
		await storage.putObject('static01', 'test.png', await fs.readFile(path.resolve(__dirname, '../assets/android-btn-big.png')));
		console.log('CREATED');
		await storage.putObjectAcl('static01', 'test.png', 'public-read');
		console.log('PUBLIC');
		await storage.getObject('static01', 'test.png');
		console.log('READ');
		await storage.deleteObject('static01', 'test.png');
		console.log('DELETED');
	} catch (e) {
		console.error(e);
	}
})();
*/
