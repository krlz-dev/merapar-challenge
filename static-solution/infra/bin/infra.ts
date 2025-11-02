#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SimpleStaticStack } from '../stacks/simple-static-stack';

const app = new cdk.App();

const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION || 'us-west-2' 
};

// Static solution only deploys the Simple Static Stack
new SimpleStaticStack(app, 'AstroDynamicTextSimpleStack', { env });
console.log('Deploying Simple Static stack (S3 + CloudFront)');