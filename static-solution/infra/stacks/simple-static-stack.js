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
            sources: [s3Deploy.Source.asset('..')],
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
exports.SimpleStaticStack = SimpleStaticStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLXN0YXRpYy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNpbXBsZS1zdGF0aWMtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsdURBQXlDO0FBQ3pDLHdFQUEwRDtBQUMxRCx1RUFBeUQ7QUFDekQsNEVBQThEO0FBQzlELHlEQUEyQztBQUczQyxNQUFhLGlCQUFrQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzlDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSwyQkFBMkIsRUFBRTtZQUNyRSxVQUFVLEVBQUUsd0JBQXdCLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNqRSxnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDO2dCQUMxQyxlQUFlLEVBQUUsSUFBSTtnQkFDckIsaUJBQWlCLEVBQUUsS0FBSztnQkFDeEIsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIscUJBQXFCLEVBQUUsS0FBSzthQUM3QixDQUFDO1lBQ0Ysb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixJQUFJLEVBQUU7Z0JBQ0o7b0JBQ0UsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDO29CQUNyQixjQUFjLEVBQUUsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztv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LEVBQUUsd0RBQXdELFlBQVksQ0FBQyxjQUFjLDRDQUE0QztZQUN0SSxXQUFXLEVBQUUsZ0RBQWdEO1NBQzlELENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQW5IRCw4Q0FtSEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCAqIGFzIHMzRGVwbG95IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50JztcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQnO1xuaW1wb3J0ICogYXMgb3JpZ2lucyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udC1vcmlnaW5zJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5leHBvcnQgY2xhc3MgU2ltcGxlU3RhdGljU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB3ZWJzaXRlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnU2ltcGxlc3RBbHRlcm5hdGl2ZUJ1Y2tldCcsIHtcbiAgICAgIGJ1Y2tldE5hbWU6IGBzaW1wbGVzdC1hbHRlcm5hdGl2ZS0ke3RoaXMuYWNjb3VudH0tJHt0aGlzLnJlZ2lvbn1gLFxuICAgICAgcHVibGljUmVhZEFjY2VzczogdHJ1ZSxcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBuZXcgczMuQmxvY2tQdWJsaWNBY2Nlc3Moe1xuICAgICAgICBibG9ja1B1YmxpY0FjbHM6IHRydWUsXG4gICAgICAgIGJsb2NrUHVibGljUG9saWN5OiBmYWxzZSxcbiAgICAgICAgaWdub3JlUHVibGljQWNsczogdHJ1ZSxcbiAgICAgICAgcmVzdHJpY3RQdWJsaWNCdWNrZXRzOiBmYWxzZSxcbiAgICAgIH0pLFxuICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6ICdpbmRleC5odG1sJyxcbiAgICAgIHdlYnNpdGVFcnJvckRvY3VtZW50OiAnaW5kZXguaHRtbCcsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWUsXG4gICAgICBjb3JzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBhbGxvd2VkSGVhZGVyczogWycqJ10sXG4gICAgICAgICAgYWxsb3dlZE1ldGhvZHM6IFtzMy5IdHRwTWV0aG9kcy5HRVQsIHMzLkh0dHBNZXRob2RzLkhFQURdLFxuICAgICAgICAgIGFsbG93ZWRPcmlnaW5zOiBbJyonXSxcbiAgICAgICAgICBtYXhBZ2U6IDMwMDAsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKHRoaXMsICdTaW1wbGVzdEFsdGVybmF0aXZlRGlzdHJpYnV0aW9uJywge1xuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4od2Vic2l0ZUJ1Y2tldCksXG4gICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICBjYWNoZVBvbGljeTogbmV3IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kodGhpcywgJ1NpbXBsZXN0QWx0ZXJuYXRpdmVDYWNoZVBvbGljeScsIHtcbiAgICAgICAgICBjYWNoZVBvbGljeU5hbWU6ICdTaW1wbGVzdEFsdGVybmF0aXZlUG9saWN5JyxcbiAgICAgICAgICBjb21tZW50OiAnQ2FjaGUgcG9saWN5IGZvciBzaW1wbGVzdCBhbHRlcm5hdGl2ZSBkZW1vJyxcbiAgICAgICAgICBkZWZhdWx0VHRsOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgICAgICBtYXhUdGw6IGNkay5EdXJhdGlvbi5ob3VycygxKSxcbiAgICAgICAgICBtaW5UdGw6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDApLFxuICAgICAgICAgIGhlYWRlckJlaGF2aW9yOiBjbG91ZGZyb250LkNhY2hlSGVhZGVyQmVoYXZpb3Iubm9uZSgpLFxuICAgICAgICAgIGNvb2tpZUJlaGF2aW9yOiBjbG91ZGZyb250LkNhY2hlQ29va2llQmVoYXZpb3Iubm9uZSgpLFxuICAgICAgICAgIHF1ZXJ5U3RyaW5nQmVoYXZpb3I6IGNsb3VkZnJvbnQuQ2FjaGVRdWVyeVN0cmluZ0JlaGF2aW9yLmFsbCgpLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgICBhZGRpdGlvbmFsQmVoYXZpb3JzOiB7XG4gICAgICAgICcvY29uZmlnLmpzb24nOiB7XG4gICAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbih3ZWJzaXRlQnVja2V0KSxcbiAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgICBjYWNoZVBvbGljeTogbmV3IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kodGhpcywgJ0NvbmZpZ0pzb25DYWNoZVBvbGljeScsIHtcbiAgICAgICAgICAgIGNhY2hlUG9saWN5TmFtZTogJ0NvbmZpZ0pzb25Qb2xpY3knLFxuICAgICAgICAgICAgY29tbWVudDogJ1Zlcnkgc2hvcnQgY2FjaGUgZm9yIGNvbmZpZy5qc29uIHVwZGF0ZXMnLFxuICAgICAgICAgICAgZGVmYXVsdFR0bDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMSksXG4gICAgICAgICAgICBtYXhUdGw6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgICAgICAgbWluVHRsOiBjZGsuRHVyYXRpb24uc2Vjb25kcygwKSxcbiAgICAgICAgICAgIGhlYWRlckJlaGF2aW9yOiBjbG91ZGZyb250LkNhY2hlSGVhZGVyQmVoYXZpb3Iubm9uZSgpLFxuICAgICAgICAgICAgY29va2llQmVoYXZpb3I6IGNsb3VkZnJvbnQuQ2FjaGVDb29raWVCZWhhdmlvci5ub25lKCksXG4gICAgICAgICAgICBxdWVyeVN0cmluZ0JlaGF2aW9yOiBjbG91ZGZyb250LkNhY2hlUXVlcnlTdHJpbmdCZWhhdmlvci5hbGwoKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBjb21tZW50OiAnQ2xvdWRGcm9udCBkaXN0cmlidXRpb24gZm9yIHNpbXBsZXN0IGFsdGVybmF0aXZlIGRlbW8nLFxuICAgIH0pO1xuXG4gICAgbmV3IHMzRGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ1NpbXBsZXN0QWx0ZXJuYXRpdmVEZXBsb3ltZW50Jywge1xuICAgICAgc291cmNlczogW3MzRGVwbG95LlNvdXJjZS5hc3NldCgnLi4nKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogd2Vic2l0ZUJ1Y2tldCxcbiAgICAgIGRpc3RyaWJ1dGlvbjogZGlzdHJpYnV0aW9uLFxuICAgICAgZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHVwZGF0ZVVzZXIgPSBuZXcgaWFtLlVzZXIodGhpcywgJ1NpbXBsZXN0QWx0ZXJuYXRpdmVVcGRhdGVVc2VyJywge1xuICAgICAgdXNlck5hbWU6ICdzaW1wbGVzdC1hbHRlcm5hdGl2ZS11cGRhdGVyJyxcbiAgICB9KTtcblxuICAgIHdlYnNpdGVCdWNrZXQuZ3JhbnRQdXQodXBkYXRlVXNlciwgJ2NvbmZpZy5qc29uJyk7XG4gICAgd2Vic2l0ZUJ1Y2tldC5ncmFudFB1dEFjbCh1cGRhdGVVc2VyLCAnY29uZmlnLmpzb24nKTtcblxuICAgIGNvbnN0IGFjY2Vzc0tleSA9IG5ldyBpYW0uQWNjZXNzS2V5KHRoaXMsICdTaW1wbGVzdEFsdGVybmF0aXZlQWNjZXNzS2V5Jywge1xuICAgICAgdXNlcjogdXBkYXRlVXNlcixcbiAgICB9KTtcblxuICAgIC8vIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnV2Vic2l0ZVVSTCcsIHtcbiAgICAgIHZhbHVlOiBgaHR0cHM6Ly8ke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25Eb21haW5OYW1lfWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Nsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIFVSTCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnUzNCdWNrZXROYW1lJywge1xuICAgICAgdmFsdWU6IHdlYnNpdGVCdWNrZXQuYnVja2V0TmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUzMgYnVja2V0IG5hbWUnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Nsb3VkRnJvbnREaXN0cmlidXRpb25JZCcsIHtcbiAgICAgIHZhbHVlOiBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Nsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIElEIGZvciBjYWNoZSBpbnZhbGlkYXRpb24nLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VwZGF0ZUFjY2Vzc0tleUlkJywge1xuICAgICAgdmFsdWU6IGFjY2Vzc0tleS5hY2Nlc3NLZXlJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWNjZXNzIEtleSBJRCBmb3IgY29udGVudCB1cGRhdGVzIChGT1IgREVNTyBPTkxZKScsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnVXBkYXRlU2VjcmV0QWNjZXNzS2V5Jywge1xuICAgICAgdmFsdWU6IGFjY2Vzc0tleS5zZWNyZXRBY2Nlc3NLZXkudW5zYWZlVW53cmFwKCksXG4gICAgICBkZXNjcmlwdGlvbjogJ1NlY3JldCBBY2Nlc3MgS2V5IGZvciBjb250ZW50IHVwZGF0ZXMgKEZPUiBERU1PIE9OTFkgLSBLRUVQIFNFQ1VSRSknLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VwZGF0ZUNvbW1hbmQnLCB7XG4gICAgICB2YWx1ZTogYGF3cyBzMyBjcCBjb25maWcuanNvbiBzMzovLyR7d2Vic2l0ZUJ1Y2tldC5idWNrZXROYW1lfS9jb25maWcuanNvbiAtLWFjbCBwdWJsaWMtcmVhZCAtLXByb2ZpbGUgcGVyc29uYWxgLFxuICAgICAgZGVzY3JpcHRpb246ICdDb21tYW5kIHRvIHVwZGF0ZSBjb25maWcuanNvbicsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSW52YWxpZGF0ZUNvbW1hbmQnLCB7XG4gICAgICB2YWx1ZTogYGF3cyBjbG91ZGZyb250IGNyZWF0ZS1pbnZhbGlkYXRpb24gLS1kaXN0cmlidXRpb24taWQgJHtkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWR9IC0tcGF0aHMgXCIvY29uZmlnLmpzb25cIiAtLXByb2ZpbGUgcGVyc29uYWxgLFxuICAgICAgZGVzY3JpcHRpb246ICdDb21tYW5kIHRvIGZvcmNlIGltbWVkaWF0ZSBjb25maWcuanNvbiByZWZyZXNoJyxcbiAgICB9KTtcbiAgfVxufSJdfQ==