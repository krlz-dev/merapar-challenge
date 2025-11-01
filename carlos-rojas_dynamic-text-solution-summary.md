# Dynamic Text Solution - Executive Summary

**Author:** Carlos Andres Monserrat Rojas Rojas  
**Date:** November 2025  

## Challenge
Build a web application displaying dynamic text with two constraints:
1. Content updates without code redeployment
2. Consistent URL regardless of content

## Solutions Implemented

### Static S3 + CloudFront
- **Cost**: $0.50/month
- **Update Speed**: 1-5 minutes
- **Method**: File upload to S3
- **Best For**: Cost-sensitive, infrequent updates

### Server-Side Rendering (ECS)
- **Cost**: $35/month  
- **Update Speed**: <100ms
- **Method**: Real-time admin interface
- **Best For**: Immediate updates, interactive features

## Key Insights

**Cost vs Performance Trade-off**: 70x price difference between solutions meeting identical requirements.

**Technology Agnostic**: Any framework with server interaction capability can solve this challenge (Angular, React, Vue, Spring Boot, Django, etc.).

**Evolution Path**: Start simple, scale complexity as needed - Static → Serverless → Container-based.

## Live Demonstrations
- **SSR Solution**: https://d1jk0h2l40omp5.cloudfront.net
- **Static Solution**: https://simplest-alternative-944473419677-us-west-2.s3.us-west-2.amazonaws.com/index.html

## Recommendation
Choose approach based on:
- **Static**: Minimal cost, acceptable update delays
- **Serverless**: Balanced cost/performance for moderate traffic  
- **SSR**: Real-time requirements justify operational complexity

The project demonstrates that identical functional requirements can be satisfied with dramatically different architectural approaches depending on quality attribute priorities.