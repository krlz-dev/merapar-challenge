import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SSRStack } from '../stacks/ssr-stack';

// Basic test for SSR stack creation
test('SSR Stack Resources Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SSRStack(app, 'TestSSRStack');
  // THEN
  const template = Template.fromStack(stack);

  // Check that key resources are created
  template.hasResourceProperties('AWS::ECS::Cluster', {
    ClusterName: 'astro-dynamic-text-cluster'
  });
  
  template.hasResourceProperties('AWS::ECR::Repository', {
    RepositoryName: 'astro-dynamic-text'
  });
});
