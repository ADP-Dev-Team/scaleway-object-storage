import { IBucket } from './model';

export interface IGetService {
	ListAllMyBucketsResult: {
		ID: string;
		DisplayName: string;
		Buckets: {
			Bucket: IBucket[];
		};
	};
}

export interface IGetBucket {
	ListBucketResult: {
		Name: string;
		Prefix: string;
		Marker: string;
		MaxKeys: number;
		IsTruncated: boolean;
	};
}