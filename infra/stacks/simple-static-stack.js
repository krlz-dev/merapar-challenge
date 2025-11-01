"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleStaticStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const s3Deploy = __importStar(require("aws-cdk-lib/aws-s3-deployment"));
const cloudfront = __importStar(require("aws-cdk-lib/aws-cloudfront"));
const origins = __importStar(require("aws-cdk-lib/aws-cloudfront-origins"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
class SimpleStaticStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.SimpleStaticStack = SimpleStaticStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLXN0YXRpYy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNpbXBsZS1zdGF0aWMtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsdURBQXlDO0FBQ3pDLHdFQUEwRDtBQUMxRCx1RUFBeUQ7QUFDekQsNEVBQThEO0FBQzlELHlEQUEyQztBQUczQyxNQUFhLGlCQUFrQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzlDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsOENBQThDO1FBQzlDLE1BQU0sYUFBYSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsMkJBQTJCLEVBQUU7WUFDckUsVUFBVSxFQUFFLHdCQUF3QixJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDakUsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDMUMsZUFBZSxFQUFFLElBQUk7Z0JBQ3JCLGlCQUFpQixFQUFFLEtBQUssRUFBRSw4Q0FBOEM7Z0JBQ3hFLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLHFCQUFxQixFQUFFLEtBQUssRUFBRSw2QkFBNkI7YUFDNUQsQ0FBQztZQUNGLG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsMENBQTBDO1lBQ3BGLGlCQUFpQixFQUFFLElBQUksRUFBRSwwQ0FBMEM7WUFDbkUsSUFBSSxFQUFFO2dCQUNKO29CQUNFLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztvQkFDckIsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ3pELGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztvQkFDckIsTUFBTSxFQUFFLElBQUk7aUJBQ2I7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILGlDQUFpQztRQUNqQyxNQUFNLFlBQVksR0FBRyxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGlDQUFpQyxFQUFFO1lBQ3hGLGVBQWUsRUFBRTtnQkFDZixNQUFNLEVBQUUsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztnQkFDM0Msb0JBQW9CLEVBQUUsVUFBVSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQjtnQkFDdkUsV0FBVyxFQUFFLElBQUksVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZ0NBQWdDLEVBQUU7b0JBQzlFLGVBQWUsRUFBRSwyQkFBMkI7b0JBQzVDLE9BQU8sRUFBRSw0Q0FBNEM7b0JBQ3JELFVBQVUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSwyQ0FBMkM7b0JBQ2hGLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQy9CLGNBQWMsRUFBRSxVQUFVLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFO29CQUNyRCxjQUFjLEVBQUUsVUFBVSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRTtvQkFDckQsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxFQUFFLHNCQUFzQjtpQkFDdkYsQ0FBQzthQUNIO1lBQ0QsbUJBQW1CLEVBQUU7Z0JBQ25CLDREQUE0RDtnQkFDNUQsY0FBYyxFQUFFO29CQUNkLE1BQU0sRUFBRSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO29CQUMzQyxvQkFBb0IsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCO29CQUN2RSxXQUFXLEVBQUUsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTt3QkFDckUsZUFBZSxFQUFFLGtCQUFrQjt3QkFDbkMsT0FBTyxFQUFFLDBDQUEwQzt3QkFDbkQsVUFBVSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLGdDQUFnQzt3QkFDckUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDL0IsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDL0IsY0FBYyxFQUFFLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUU7d0JBQ3JELGNBQWMsRUFBRSxVQUFVLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFO3dCQUNyRCxtQkFBbUIsRUFBRSxVQUFVLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLEVBQUUsc0JBQXNCO3FCQUN2RixDQUFDO2lCQUNIO2FBQ0Y7WUFDRCxPQUFPLEVBQUUsdURBQXVEO1NBQ2pFLENBQUMsQ0FBQztRQUVILDRCQUE0QjtRQUM1QixJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsK0JBQStCLEVBQUU7WUFDbkUsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUMzRCxpQkFBaUIsRUFBRSxhQUFhO1lBQ2hDLFlBQVksRUFBRSxZQUFZO1lBQzFCLGlCQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUscUNBQXFDO1NBQ2pFLENBQUMsQ0FBQztRQUVILDJEQUEyRDtRQUMzRCxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLCtCQUErQixFQUFFO1lBQ3JFLFFBQVEsRUFBRSw4QkFBOEI7U0FDekMsQ0FBQyxDQUFDO1FBRUgsNERBQTREO1FBQzVELGFBQWEsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ2xELGFBQWEsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRXJELCtFQUErRTtRQUMvRSxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLDhCQUE4QixFQUFFO1lBQ3hFLElBQUksRUFBRSxVQUFVO1NBQ2pCLENBQUMsQ0FBQztRQUVILFVBQVU7UUFDVixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNwQyxLQUFLLEVBQUUsV0FBVyxZQUFZLENBQUMsc0JBQXNCLEVBQUU7WUFDdkQsV0FBVyxFQUFFLDZCQUE2QjtTQUMzQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUN0QyxLQUFLLEVBQUUsYUFBYSxDQUFDLFVBQVU7WUFDL0IsV0FBVyxFQUFFLGdCQUFnQjtTQUM5QixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFFO1lBQ2xELEtBQUssRUFBRSxZQUFZLENBQUMsY0FBYztZQUNsQyxXQUFXLEVBQUUsbURBQW1EO1NBQ2pFLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDM0MsS0FBSyxFQUFFLFNBQVMsQ0FBQyxXQUFXO1lBQzVCLFdBQVcsRUFBRSxtREFBbUQ7U0FDakUsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUMvQyxLQUFLLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUU7WUFDL0MsV0FBVyxFQUFFLHFFQUFxRTtTQUNuRixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN2QyxLQUFLLEVBQUUsOEJBQThCLGFBQWEsQ0FBQyxVQUFVLG1EQUFtRDtZQUNoSCxXQUFXLEVBQUUsK0JBQStCO1NBQzdDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDM0MsS0FBSyxFQUFFLHdEQUF3RCxZQUFZLENBQUMsY0FBYyw0Q0FBNEM7WUFDdEksV0FBVyxFQUFFLGdEQUFnRDtTQUM5RCxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUExSEQsOENBMEhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgKiBhcyBzM0RlcGxveSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMtZGVwbG95bWVudCc7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250JztcbmltcG9ydCAqIGFzIG9yaWdpbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQtb3JpZ2lucyc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGNsYXNzIFNpbXBsZVN0YXRpY1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ3JlYXRlIFMzIGJ1Y2tldCBmb3Igc3RhdGljIHdlYnNpdGUgaG9zdGluZ1xuICAgIGNvbnN0IHdlYnNpdGVCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdTaW1wbGVzdEFsdGVybmF0aXZlQnVja2V0Jywge1xuICAgICAgYnVja2V0TmFtZTogYHNpbXBsZXN0LWFsdGVybmF0aXZlLSR7dGhpcy5hY2NvdW50fS0ke3RoaXMucmVnaW9ufWAsXG4gICAgICBwdWJsaWNSZWFkQWNjZXNzOiB0cnVlLFxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IG5ldyBzMy5CbG9ja1B1YmxpY0FjY2Vzcyh7XG4gICAgICAgIGJsb2NrUHVibGljQWNsczogdHJ1ZSxcbiAgICAgICAgYmxvY2tQdWJsaWNQb2xpY3k6IGZhbHNlLCAvLyBBbGxvdyBwdWJsaWMgYnVja2V0IHBvbGljaWVzIGZvciBDbG91ZEZyb250XG4gICAgICAgIGlnbm9yZVB1YmxpY0FjbHM6IHRydWUsXG4gICAgICAgIHJlc3RyaWN0UHVibGljQnVja2V0czogZmFsc2UsIC8vIEFsbG93IHB1YmxpYyBidWNrZXQgYWNjZXNzXG4gICAgICB9KSxcbiAgICAgIHdlYnNpdGVJbmRleERvY3VtZW50OiAnaW5kZXguaHRtbCcsXG4gICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogJ2luZGV4Lmh0bWwnLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSwgLy8gRk9SIERFTU8gT05MWSAtIERvbid0IHVzZSBpbiBwcm9kdWN0aW9uXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSwgLy8gRk9SIERFTU8gT05MWSAtIERvbid0IHVzZSBpbiBwcm9kdWN0aW9uXG4gICAgICBjb3JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBhbGxvd2VkSGVhZGVyczogWycqJ10sXG4gICAgICAgICAgYWxsb3dlZE1ldGhvZHM6IFtzMy5IdHRwTWV0aG9kcy5HRVQsIHMzLkh0dHBNZXRob2RzLkhFQURdLFxuICAgICAgICAgIGFsbG93ZWRPcmlnaW5zOiBbJyonXSxcbiAgICAgICAgICBtYXhBZ2U6IDMwMDAsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uXG4gICAgY29uc3QgZGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKHRoaXMsICdTaW1wbGVzdEFsdGVybmF0aXZlRGlzdHJpYnV0aW9uJywge1xuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4od2Vic2l0ZUJ1Y2tldCksXG4gICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICBjYWNoZVBvbGljeTogbmV3IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kodGhpcywgJ1NpbXBsZXN0QWx0ZXJuYXRpdmVDYWNoZVBvbGljeScsIHtcbiAgICAgICAgICBjYWNoZVBvbGljeU5hbWU6ICdTaW1wbGVzdEFsdGVybmF0aXZlUG9saWN5JyxcbiAgICAgICAgICBjb21tZW50OiAnQ2FjaGUgcG9saWN5IGZvciBzaW1wbGVzdCBhbHRlcm5hdGl2ZSBkZW1vJyxcbiAgICAgICAgICBkZWZhdWx0VHRsOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSwgLy8gU2hvcnQgVFRMIGZvciBkZW1vIC0gY29uZmlnLmpzb24gY2hhbmdlc1xuICAgICAgICAgIG1heFR0bDogY2RrLkR1cmF0aW9uLmhvdXJzKDEpLFxuICAgICAgICAgIG1pblR0bDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMCksXG4gICAgICAgICAgaGVhZGVyQmVoYXZpb3I6IGNsb3VkZnJvbnQuQ2FjaGVIZWFkZXJCZWhhdmlvci5ub25lKCksXG4gICAgICAgICAgY29va2llQmVoYXZpb3I6IGNsb3VkZnJvbnQuQ2FjaGVDb29raWVCZWhhdmlvci5ub25lKCksXG4gICAgICAgICAgcXVlcnlTdHJpbmdCZWhhdmlvcjogY2xvdWRmcm9udC5DYWNoZVF1ZXJ5U3RyaW5nQmVoYXZpb3IuYWxsKCksIC8vIEFsbG93IGNhY2hlIGJ1c3RpbmdcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgICAgYWRkaXRpb25hbEJlaGF2aW9yczoge1xuICAgICAgICAvLyBTcGVjaWFsIGNhY2hlIGJlaGF2aW9yIGZvciBjb25maWcuanNvbiAtIGV2ZW4gc2hvcnRlciBUVExcbiAgICAgICAgJy9jb25maWcuanNvbic6IHtcbiAgICAgICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLlMzT3JpZ2luKHdlYnNpdGVCdWNrZXQpLFxuICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICAgIGNhY2hlUG9saWN5OiBuZXcgY2xvdWRmcm9udC5DYWNoZVBvbGljeSh0aGlzLCAnQ29uZmlnSnNvbkNhY2hlUG9saWN5Jywge1xuICAgICAgICAgICAgY2FjaGVQb2xpY3lOYW1lOiAnQ29uZmlnSnNvblBvbGljeScsXG4gICAgICAgICAgICBjb21tZW50OiAnVmVyeSBzaG9ydCBjYWNoZSBmb3IgY29uZmlnLmpzb24gdXBkYXRlcycsXG4gICAgICAgICAgICBkZWZhdWx0VHRsOiBjZGsuRHVyYXRpb24ubWludXRlcygxKSwgLy8gVmVyeSBzaG9ydCBmb3IgY29uZmlnIGNoYW5nZXNcbiAgICAgICAgICAgIG1heFR0bDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgICAgICBtaW5UdGw6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDApLFxuICAgICAgICAgICAgaGVhZGVyQmVoYXZpb3I6IGNsb3VkZnJvbnQuQ2FjaGVIZWFkZXJCZWhhdmlvci5ub25lKCksXG4gICAgICAgICAgICBjb29raWVCZWhhdmlvcjogY2xvdWRmcm9udC5DYWNoZUNvb2tpZUJlaGF2aW9yLm5vbmUoKSxcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nQmVoYXZpb3I6IGNsb3VkZnJvbnQuQ2FjaGVRdWVyeVN0cmluZ0JlaGF2aW9yLmFsbCgpLCAvLyBBbGxvdyBjYWNoZSBidXN0aW5nXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgY29tbWVudDogJ0Nsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIGZvciBzaW1wbGVzdCBhbHRlcm5hdGl2ZSBkZW1vJyxcbiAgICB9KTtcblxuICAgIC8vIERlcGxveSBzdGF0aWMgZmlsZXMgdG8gUzNcbiAgICBuZXcgczNEZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnU2ltcGxlc3RBbHRlcm5hdGl2ZURlcGxveW1lbnQnLCB7XG4gICAgICBzb3VyY2VzOiBbczNEZXBsb3kuU291cmNlLmFzc2V0KCcuLi9zaW1wbGVzdC1hbHRlcm5hdGl2ZScpXSxcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB3ZWJzaXRlQnVja2V0LFxuICAgICAgZGlzdHJpYnV0aW9uOiBkaXN0cmlidXRpb24sXG4gICAgICBkaXN0cmlidXRpb25QYXRoczogWycvKiddLCAvLyBJbnZhbGlkYXRlIGFsbCBmaWxlcyBvbiBkZXBsb3ltZW50XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgSUFNIHVzZXIgZm9yIGVhc3kgY29udGVudCB1cGRhdGVzIChGT1IgREVNTyBPTkxZKVxuICAgIGNvbnN0IHVwZGF0ZVVzZXIgPSBuZXcgaWFtLlVzZXIodGhpcywgJ1NpbXBsZXN0QWx0ZXJuYXRpdmVVcGRhdGVVc2VyJywge1xuICAgICAgdXNlck5hbWU6ICdzaW1wbGVzdC1hbHRlcm5hdGl2ZS11cGRhdGVyJyxcbiAgICB9KTtcblxuICAgIC8vIEdyYW50IHRoZSB1c2VyIHBlcm1pc3Npb24gdG8gdXBkYXRlIG9iamVjdHMgaW4gdGhlIGJ1Y2tldFxuICAgIHdlYnNpdGVCdWNrZXQuZ3JhbnRQdXQodXBkYXRlVXNlciwgJ2NvbmZpZy5qc29uJyk7XG4gICAgd2Vic2l0ZUJ1Y2tldC5ncmFudFB1dEFjbCh1cGRhdGVVc2VyLCAnY29uZmlnLmpzb24nKTtcblxuICAgIC8vIENyZWF0ZSBhY2Nlc3Mga2V5IGZvciB0aGUgdXNlciAoRk9SIERFTU8gT05MWSAtIHVzZSBJQU0gcm9sZXMgaW4gcHJvZHVjdGlvbilcbiAgICBjb25zdCBhY2Nlc3NLZXkgPSBuZXcgaWFtLkFjY2Vzc0tleSh0aGlzLCAnU2ltcGxlc3RBbHRlcm5hdGl2ZUFjY2Vzc0tleScsIHtcbiAgICAgIHVzZXI6IHVwZGF0ZVVzZXIsXG4gICAgfSk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1dlYnNpdGVVUkwnLCB7XG4gICAgICB2YWx1ZTogYGh0dHBzOi8vJHtkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZX1gLFxuICAgICAgZGVzY3JpcHRpb246ICdDbG91ZEZyb250IGRpc3RyaWJ1dGlvbiBVUkwnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1MzQnVja2V0TmFtZScsIHtcbiAgICAgIHZhbHVlOiB3ZWJzaXRlQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1MzIGJ1Y2tldCBuYW1lJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDbG91ZEZyb250RGlzdHJpYnV0aW9uSWQnLCB7XG4gICAgICB2YWx1ZTogZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbklkLFxuICAgICAgZGVzY3JpcHRpb246ICdDbG91ZEZyb250IGRpc3RyaWJ1dGlvbiBJRCBmb3IgY2FjaGUgaW52YWxpZGF0aW9uJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdVcGRhdGVBY2Nlc3NLZXlJZCcsIHtcbiAgICAgIHZhbHVlOiBhY2Nlc3NLZXkuYWNjZXNzS2V5SWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FjY2VzcyBLZXkgSUQgZm9yIGNvbnRlbnQgdXBkYXRlcyAoRk9SIERFTU8gT05MWSknLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VwZGF0ZVNlY3JldEFjY2Vzc0tleScsIHtcbiAgICAgIHZhbHVlOiBhY2Nlc3NLZXkuc2VjcmV0QWNjZXNzS2V5LnVuc2FmZVVud3JhcCgpLFxuICAgICAgZGVzY3JpcHRpb246ICdTZWNyZXQgQWNjZXNzIEtleSBmb3IgY29udGVudCB1cGRhdGVzIChGT1IgREVNTyBPTkxZIC0gS0VFUCBTRUNVUkUpJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdVcGRhdGVDb21tYW5kJywge1xuICAgICAgdmFsdWU6IGBhd3MgczMgY3AgY29uZmlnLmpzb24gczM6Ly8ke3dlYnNpdGVCdWNrZXQuYnVja2V0TmFtZX0vY29uZmlnLmpzb24gLS1hY2wgcHVibGljLXJlYWQgLS1wcm9maWxlIHBlcnNvbmFsYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29tbWFuZCB0byB1cGRhdGUgY29uZmlnLmpzb24nLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0ludmFsaWRhdGVDb21tYW5kJywge1xuICAgICAgdmFsdWU6IGBhd3MgY2xvdWRmcm9udCBjcmVhdGUtaW52YWxpZGF0aW9uIC0tZGlzdHJpYnV0aW9uLWlkICR7ZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbklkfSAtLXBhdGhzIFwiL2NvbmZpZy5qc29uXCIgLS1wcm9maWxlIHBlcnNvbmFsYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29tbWFuZCB0byBmb3JjZSBpbW1lZGlhdGUgY29uZmlnLmpzb24gcmVmcmVzaCcsXG4gICAgfSk7XG4gIH1cbn0iXX0=