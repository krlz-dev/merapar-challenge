#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();
new InfraStack(app, 'InfraStack', {
  /* Configured for AWS Account and Region from CLI profile configuration. */
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-west-2' 
  },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});