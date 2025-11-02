#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SSRStack } from '../stacks/ssr-stack';

const app = new cdk.App();

const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION || 'us-west-2' 
};

// SSR solution only deploys the SSR Stack
new SSRStack(app, 'AstroDynamicTextSSRStack', { env });
console.log('Deploying SSR stack (ECS + CloudFront)');