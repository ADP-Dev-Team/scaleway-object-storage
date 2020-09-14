import Api from './api';

export {
	Api as default,
};

// TODO Bucket class
// TODO streams

/*
https://www.scaleway.com/en/docs/s3-object-storage-api/

DELETE Bucket	✔	Deletes bucket
DELETE Bucket analytics	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
DELETE Bucket CORS	✔	Deletes the CORS configuration of a bucket
DELETE Bucket encryption	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
DELETE Bucket inventory	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
DELETE Bucket lifecycle	✔	Deletes the lifecycle configuration of a bucket
DELETE Bucket metrics	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
DELETE Bucket policy	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
DELETE Bucket replication	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
DELETE Bucket taging	✔	Deletes the tag(s) of a bucket
DELETE Bucket website	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
GET Bucket	✔	Lists objects
GET Bucket accelerate	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
GET Bucket ACL	✔	Returns the bucket ACL
GET Bucket analytics	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
GET Bucket CORS	✔	Returns the CORS configuration of a bucket
GET Bucket encryption	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
GET Bucket inventory	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
GET Bucket lifecycle	✔	Returns the lifecycle configuration of a bucket
GET Bucket location	✔	Returns the region where the bucket is
GET Bucket logging	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
GET Bucket metrics	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
GET Bucket notification	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
GET Bucket Object versions	✔	Returns metadata about all of the versions of objects in a bucket
GET Bucket policy	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
GET Bucket replication	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
GET Bucket requestPayment	✘	Unscheduled
GET Bucket tagging	✔	Returns the tag(s) of a bucket
GET Bucket versioning	✔	Returns the versioning state of a bucket
GET Bucket website	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
HEAD Bucket	✔	Checks if the bucket exists
List Bucket Analytics Configurations	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
List Bucket Inventory Configurations	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
List Bucket Metrics Configurations	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
PUT Bucket	✔	Creates bucket
PUT Bucket accelerate	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
PUT Bucket ACL	✔	Configures the Access Control List of a bucket
PUT Bucket analytics	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
PUT Bucket CORS	✔	Configures Cross-origin ressource sharing(CORS) on a bucket
PUT Bucket encryption	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
PUT Bucket inventory	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
PUT Bucket lifecycle	✔	Sets the lifecycle configuration of a bucket
PUT Bucket inventory	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
PUT Bucket logging	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
PUT Bucket notification	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
PUT Bucket policy	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
PUT Bucket replication	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
PUT Bucket requestPayment	✘	Unscheduled
PUT Bucket tagging	✔	Sets the tag(s) of a bucket
PUT Bucket versioning	✔	Sets the versioning state of an existing bucket
PUT Bucket website	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development

DELETE Multiple Objects	✔	Deletes multiple object with one call
DELETE Object tagging	✔	Deletes the tag(s) of an object
GET Object ACL	✔	Gets the ACL of an object
GET Object tagging	✔	Get the tag(s) of an object
GET Object torrent	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
HEAD Object	✔	Gets object metadata
OPTIONS Object	✔	Allows to send a preflight request to trigger an evaluation of the rules that are defined in the CORS configuration
POST Object	✔	Adds an object to a bucket by using HTML forms
POST Object restore	✔	Restore an object from Glacier
PUT Object copy	✔	Copies an object
PUT Object tagging	✔	Adds one or several tags to an object
SELECT Object Content (Preview)	✘	We are eagerly awaiting for your feedback! Please get in touch with us on Slack for this feature request development
Multipart	✔	Initiates, aborts, completes, lists, uploads, uploads copy
*/