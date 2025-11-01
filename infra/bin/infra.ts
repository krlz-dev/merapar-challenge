#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SSRStack, SimpleStaticStack } from '../lib';

const app = new cdk.App();

// Get deployment target from context or environment
const deploymentTarget = app.node.tryGetContext('target') || process.env.DEPLOYMENT_TARGET || 'ssr';

const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION || 'us-west-2' 
};

switch (deploymentTarget) {
  case 'ssr':
    new SSRStack(app, 'AstroDynamicTextSSRStack', { env });
    console.log('Deploying SSR stack (ECS + CloudFront)');
    break;
    
  case 'simple':
  case 'static':
    new SimpleStaticStack(app, 'AstroDynamicTextSimpleStack', { env });
    console.log('Deploying Simple Static stack (S3 + CloudFront)');
    break;
    
  case 'both':
    new SSRStack(app, 'AstroDynamicTextSSRStack', { env });
    new SimpleStaticStack(app, 'AstroDynamicTextSimpleStack', { env });
    console.log('Deploying both SSR and Simple Static stacks');
    break;
    
  default:
    console.error(`Unknown deployment target: ${deploymentTarget}`);
    console.error('Valid targets: ssr, simple, static, both');
    process.exit(1);
}