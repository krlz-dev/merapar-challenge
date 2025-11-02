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

    const websiteBucket = new s3.Bucket(this, 'SimplestAlternativeBucket', {
      bucketName: `simplest-alternative-${this.account}-${this.region}`,
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: false,
        ignorePublicAcls: true,
        restrictPublicBuckets: false,
      }),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          maxAge: 3000,
        },
      ],
    });

    const distribution = new cloudfront.Distribution(this, 'SimplestAlternativeDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: new cloudfront.CachePolicy(this, 'SimplestAlternativeCachePolicy', {
          cachePolicyName: 'SimplestAlternativePolicy',
          comment: 'Cache policy for simplest alternative demo',
          defaultTtl: cdk.Duration.minutes(5),
          maxTtl: cdk.Duration.hours(1),
          minTtl: cdk.Duration.seconds(0),
          headerBehavior: cloudfront.CacheHeaderBehavior.none(),
          cookieBehavior: cloudfront.CacheCookieBehavior.none(),
          queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
        }),
      },
      additionalBehaviors: {
        '/config.json': {
          origin: new origins.S3Origin(websiteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: new cloudfront.CachePolicy(this, 'ConfigJsonCachePolicy', {
            cachePolicyName: 'ConfigJsonPolicy',
            comment: 'Very short cache for config.json updates',
            defaultTtl: cdk.Duration.minutes(1),
            maxTtl: cdk.Duration.minutes(5),
            minTtl: cdk.Duration.seconds(0),
            headerBehavior: cloudfront.CacheHeaderBehavior.none(),
            cookieBehavior: cloudfront.CacheCookieBehavior.none(),
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
          }),
        },
      },
      comment: 'CloudFront distribution for simplest alternative demo',
    });

    new s3Deploy.BucketDeployment(this, 'SimplestAlternativeDeployment', {
      sources: [s3Deploy.Source.asset('..', {
        exclude: ['infra/**/*', 'infra']
      })],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });

    const updateUser = new iam.User(this, 'SimplestAlternativeUpdateUser', {
      userName: 'simplest-alternative-updater',
    });

    websiteBucket.grantPut(updateUser, 'config.json');
    websiteBucket.grantPutAcl(updateUser, 'config.json');

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