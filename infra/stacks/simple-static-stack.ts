import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class SimpleStaticStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for static website hosting
    const websiteBucket = new s3.Bucket(this, 'SimplestAlternativeBucket', {
      bucketName: `simplest-alternative-${this.account}-${this.region}`,
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: false, // Allow public bucket policies for CloudFront
        ignorePublicAcls: true,
        restrictPublicBuckets: false, // Allow public bucket access
      }),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // FOR DEMO ONLY - Don't use in production
      autoDeleteObjects: true, // FOR DEMO ONLY - Don't use in production
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SimplestAlternativeDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: new cloudfront.CachePolicy(this, 'SimplestAlternativeCachePolicy', {
          cachePolicyName: 'SimplestAlternativePolicy',
          comment: 'Cache policy for simplest alternative demo',
          defaultTtl: cdk.Duration.minutes(5), // Short TTL for demo - config.json changes
          maxTtl: cdk.Duration.hours(1),
          minTtl: cdk.Duration.seconds(0),
          headerBehavior: cloudfront.CacheHeaderBehavior.none(),
          cookieBehavior: cloudfront.CacheCookieBehavior.none(),
          queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(), // Allow cache busting
        }),
      },
      additionalBehaviors: {
        // Special cache behavior for config.json - even shorter TTL
        '/config.json': {
          origin: new origins.S3Origin(websiteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: new cloudfront.CachePolicy(this, 'ConfigJsonCachePolicy', {
            cachePolicyName: 'ConfigJsonPolicy',
            comment: 'Very short cache for config.json updates',
            defaultTtl: cdk.Duration.minutes(1), // Very short for config changes
            maxTtl: cdk.Duration.minutes(5),
            minTtl: cdk.Duration.seconds(0),
            headerBehavior: cloudfront.CacheHeaderBehavior.none(),
            cookieBehavior: cloudfront.CacheCookieBehavior.none(),
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(), // Allow cache busting
          }),
        },
      },
      comment: 'CloudFront distribution for simplest alternative demo',
    });

    // Deploy static files to S3
    new s3Deploy.BucketDeployment(this, 'SimplestAlternativeDeployment', {
      sources: [s3Deploy.Source.asset('../simplest-alternative')],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'], // Invalidate all files on deployment
    });

    // Create IAM user for easy content updates (FOR DEMO ONLY)
    const updateUser = new iam.User(this, 'SimplestAlternativeUpdateUser', {
      userName: 'simplest-alternative-updater',
    });

    // Grant the user permission to update objects in the bucket
    websiteBucket.grantPut(updateUser, 'config.json');
    websiteBucket.grantPutAcl(updateUser, 'config.json');

    // Create access key for the user (FOR DEMO ONLY - use IAM roles in production)
    const accessKey = new iam.AccessKey(this, 'SimplestAlternativeAccessKey', {
      user: updateUser,
    });

    // Outputs
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 bucket name',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID for cache invalidation',
    });

    new cdk.CfnOutput(this, 'UpdateAccessKeyId', {
      value: accessKey.accessKeyId,
      description: 'Access Key ID for content updates (FOR DEMO ONLY)',
    });

    new cdk.CfnOutput(this, 'UpdateSecretAccessKey', {
      value: accessKey.secretAccessKey.unsafeUnwrap(),
      description: 'Secret Access Key for content updates (FOR DEMO ONLY - KEEP SECURE)',
    });

    new cdk.CfnOutput(this, 'UpdateCommand', {
      value: `aws s3 cp config.json s3://${websiteBucket.bucketName}/config.json --acl public-read --profile personal`,
      description: 'Command to update config.json',
    });

    new cdk.CfnOutput(this, 'InvalidateCommand', {
      value: `aws cloudfront create-invalidation --distribution-id ${distribution.distributionId} --paths "/config.json" --profile personal`,
      description: 'Command to force immediate config.json refresh',
    });
  }
}