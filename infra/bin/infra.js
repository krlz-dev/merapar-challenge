#!/usr/bin/env node
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
const cdk = __importStar(require("aws-cdk-lib"));
const lib_1 = require("../lib");
const app = new cdk.App();
// Get deployment target from context or environment
const deploymentTarget = app.node.tryGetContext('target') || process.env.DEPLOYMENT_TARGET || 'ssr';
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-west-2'
};
switch (deploymentTarget) {
    case 'ssr':
        new lib_1.SSRStack(app, 'AstroDynamicTextSSRStack', { env });
        console.log('Deploying SSR stack (ECS + CloudFront)');
        break;
    case 'simple':
    case 'static':
        new lib_1.SimpleStaticStack(app, 'AstroDynamicTextSimpleStack', { env });
        console.log('Deploying Simple Static stack (S3 + CloudFront)');
        break;
    case 'both':
        new lib_1.SSRStack(app, 'AstroDynamicTextSSRStack', { env });
        new lib_1.SimpleStaticStack(app, 'AstroDynamicTextSimpleStack', { env });
        console.log('Deploying both SSR and Simple Static stacks');
        break;
    default:
        console.error(`Unknown deployment target: ${deploymentTarget}`);
        console.error('Valid targets: ssr, simple, static, both');
        process.exit(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmZyYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLGlEQUFtQztBQUNuQyxnQ0FBcUQ7QUFFckQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsb0RBQW9EO0FBQ3BELE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLENBQUM7QUFFcEcsTUFBTSxHQUFHLEdBQUc7SUFDVixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7SUFDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksV0FBVztDQUN0RCxDQUFDO0FBRUYsUUFBUSxnQkFBZ0IsRUFBRSxDQUFDO0lBQ3pCLEtBQUssS0FBSztRQUNSLElBQUksY0FBUSxDQUFDLEdBQUcsRUFBRSwwQkFBMEIsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ3RELE1BQU07SUFFUixLQUFLLFFBQVEsQ0FBQztJQUNkLEtBQUssUUFBUTtRQUNYLElBQUksdUJBQWlCLENBQUMsR0FBRyxFQUFFLDZCQUE2QixFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNuRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7UUFDL0QsTUFBTTtJQUVSLEtBQUssTUFBTTtRQUNULElBQUksY0FBUSxDQUFDLEdBQUcsRUFBRSwwQkFBMEIsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDdkQsSUFBSSx1QkFBaUIsQ0FBQyxHQUFHLEVBQUUsNkJBQTZCLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQztRQUMzRCxNQUFNO0lBRVI7UUFDRSxPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFDaEUsT0FBTyxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzFELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBTU1JTdGFjaywgU2ltcGxlU3RhdGljU3RhY2sgfSBmcm9tICcuLi9saWInO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG4vLyBHZXQgZGVwbG95bWVudCB0YXJnZXQgZnJvbSBjb250ZXh0IG9yIGVudmlyb25tZW50XG5jb25zdCBkZXBsb3ltZW50VGFyZ2V0ID0gYXBwLm5vZGUudHJ5R2V0Q29udGV4dCgndGFyZ2V0JykgfHwgcHJvY2Vzcy5lbnYuREVQTE9ZTUVOVF9UQVJHRVQgfHwgJ3Nzcic7XG5cbmNvbnN0IGVudiA9IHsgXG4gIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsIFxuICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTiB8fCAndXMtd2VzdC0yJyBcbn07XG5cbnN3aXRjaCAoZGVwbG95bWVudFRhcmdldCkge1xuICBjYXNlICdzc3InOlxuICAgIG5ldyBTU1JTdGFjayhhcHAsICdBc3Ryb0R5bmFtaWNUZXh0U1NSU3RhY2snLCB7IGVudiB9KTtcbiAgICBjb25zb2xlLmxvZygnRGVwbG95aW5nIFNTUiBzdGFjayAoRUNTICsgQ2xvdWRGcm9udCknKTtcbiAgICBicmVhaztcbiAgICBcbiAgY2FzZSAnc2ltcGxlJzpcbiAgY2FzZSAnc3RhdGljJzpcbiAgICBuZXcgU2ltcGxlU3RhdGljU3RhY2soYXBwLCAnQXN0cm9EeW5hbWljVGV4dFNpbXBsZVN0YWNrJywgeyBlbnYgfSk7XG4gICAgY29uc29sZS5sb2coJ0RlcGxveWluZyBTaW1wbGUgU3RhdGljIHN0YWNrIChTMyArIENsb3VkRnJvbnQpJyk7XG4gICAgYnJlYWs7XG4gICAgXG4gIGNhc2UgJ2JvdGgnOlxuICAgIG5ldyBTU1JTdGFjayhhcHAsICdBc3Ryb0R5bmFtaWNUZXh0U1NSU3RhY2snLCB7IGVudiB9KTtcbiAgICBuZXcgU2ltcGxlU3RhdGljU3RhY2soYXBwLCAnQXN0cm9EeW5hbWljVGV4dFNpbXBsZVN0YWNrJywgeyBlbnYgfSk7XG4gICAgY29uc29sZS5sb2coJ0RlcGxveWluZyBib3RoIFNTUiBhbmQgU2ltcGxlIFN0YXRpYyBzdGFja3MnKTtcbiAgICBicmVhaztcbiAgICBcbiAgZGVmYXVsdDpcbiAgICBjb25zb2xlLmVycm9yKGBVbmtub3duIGRlcGxveW1lbnQgdGFyZ2V0OiAke2RlcGxveW1lbnRUYXJnZXR9YCk7XG4gICAgY29uc29sZS5lcnJvcignVmFsaWQgdGFyZ2V0czogc3NyLCBzaW1wbGUsIHN0YXRpYywgYm90aCcpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbn0iXX0=