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
const assertions_1 = require("aws-cdk-lib/assertions");
const ssr_stack_1 = require("../stacks/ssr-stack");
// Basic test for SSR stack creation
test('SSR Stack Resources Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ssr_stack_1.SSRStack(app, 'TestSSRStack');
    // THEN
    const template = assertions_1.Template.fromStack(stack);
    // Check that key resources are created
    template.hasResourceProperties('AWS::ECS::Cluster', {
        ClusterName: 'astro-dynamic-text-cluster'
    });
    template.hasResourceProperties('AWS::ECR::Repository', {
        RepositoryName: 'astro-dynamic-text'
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmEudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluZnJhLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyx1REFBa0Q7QUFDbEQsbURBQStDO0FBRS9DLG9DQUFvQztBQUNwQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO0lBQ3ZDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzFCLE9BQU87SUFDUCxNQUFNLEtBQUssR0FBRyxJQUFJLG9CQUFRLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ2hELE9BQU87SUFDUCxNQUFNLFFBQVEsR0FBRyxxQkFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUUzQyx1Q0FBdUM7SUFDdkMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixFQUFFO1FBQ2xELFdBQVcsRUFBRSw0QkFBNEI7S0FDMUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLHFCQUFxQixDQUFDLHNCQUFzQixFQUFFO1FBQ3JELGNBQWMsRUFBRSxvQkFBb0I7S0FDckMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hc3NlcnRpb25zJztcbmltcG9ydCB7IFNTUlN0YWNrIH0gZnJvbSAnLi4vc3RhY2tzL3Nzci1zdGFjayc7XG5cbi8vIEJhc2ljIHRlc3QgZm9yIFNTUiBzdGFjayBjcmVhdGlvblxudGVzdCgnU1NSIFN0YWNrIFJlc291cmNlcyBDcmVhdGVkJywgKCkgPT4ge1xuICBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICAvLyBXSEVOXG4gIGNvbnN0IHN0YWNrID0gbmV3IFNTUlN0YWNrKGFwcCwgJ1Rlc3RTU1JTdGFjaycpO1xuICAvLyBUSEVOXG4gIGNvbnN0IHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKHN0YWNrKTtcblxuICAvLyBDaGVjayB0aGF0IGtleSByZXNvdXJjZXMgYXJlIGNyZWF0ZWRcbiAgdGVtcGxhdGUuaGFzUmVzb3VyY2VQcm9wZXJ0aWVzKCdBV1M6OkVDUzo6Q2x1c3RlcicsIHtcbiAgICBDbHVzdGVyTmFtZTogJ2FzdHJvLWR5bmFtaWMtdGV4dC1jbHVzdGVyJ1xuICB9KTtcbiAgXG4gIHRlbXBsYXRlLmhhc1Jlc291cmNlUHJvcGVydGllcygnQVdTOjpFQ1I6OlJlcG9zaXRvcnknLCB7XG4gICAgUmVwb3NpdG9yeU5hbWU6ICdhc3Ryby1keW5hbWljLXRleHQnXG4gIH0pO1xufSk7XG4iXX0=