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