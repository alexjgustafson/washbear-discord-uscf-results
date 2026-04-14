# IAM Permissions for Deploying This Application

This document describes the minimum IAM permissions needed to deploy and manage this SAM application.

## Authentication Setup

This project uses AWS IAM Identity Center (SSO) for authentication with short-lived credentials.

### Prerequisites

1. IAM Identity Center enabled in your AWS account
2. A user created in Identity Center
3. A permission set (`WashbearDiscordDeploy`) with the inline policy below attached
4. The permission set assigned to your user for the target AWS account

### Local CLI Configuration

Run `aws configure sso` and follow the prompts:

- SSO session name: any local label (e.g. `washbear`)
- SSO start URL: your AWS access portal URL (found in Identity Center → Settings)
- SSO region: the region where Identity Center is enabled
- SSO registration scopes: accept the default

The resulting profile is configured in `samconfig.toml` under `[default.global.parameters]`, so all SAM commands use it automatically.

### Daily Usage

When your session expires, re-authenticate with:

```sh
aws sso login
```

Then deploy as usual:

```sh
sam build && sam deploy
```

## Permissions Policy

The policy below uses least-privilege scoping where possible. Replace `ACCOUNT_ID` with your AWS account ID. This is used as an inline policy on the Identity Center permission set.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CloudFormationStack",
            "Effect": "Allow",
            "Action": [
                "cloudformation:CreateStack",
                "cloudformation:UpdateStack",
                "cloudformation:DeleteStack",
                "cloudformation:DescribeStacks",
                "cloudformation:DescribeStackEvents",
                "cloudformation:DescribeStackResource",
                "cloudformation:DescribeStackResources",
                "cloudformation:GetTemplate",
                "cloudformation:GetTemplateSummary",
                "cloudformation:ListStackResources",
                "cloudformation:CreateChangeSet",
                "cloudformation:DescribeChangeSet",
                "cloudformation:ExecuteChangeSet",
                "cloudformation:DeleteChangeSet"
            ],
            "Resource": "arn:aws:cloudformation:us-east-1:ACCOUNT_ID:stack/washbear-discord-app-*/*"
        },
        {
            "Sid": "CloudFormationTransform",
            "Effect": "Allow",
            "Action": "cloudformation:CreateChangeSet",
            "Resource": "arn:aws:cloudformation:us-east-1:aws:transform/Serverless-2016-10-31"
        },
        {
            "Sid": "S3ArtifactBucket",
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:PutLifecycleConfiguration",
                "s3:PutBucketPolicy",
                "s3:DeleteObject",
                "s3:DeleteBucket"
            ],
            "Resource": [
                "arn:aws:s3:::aws-sam-cli-managed-default-samclisourcebucket-*",
                "arn:aws:s3:::aws-sam-cli-managed-default-samclisourcebucket-*/*"
            ]
        },
        {
            "Sid": "S3ResolveBucket",
            "Effect": "Allow",
            "Action": [
                "cloudformation:DescribeStacks",
                "cloudformation:CreateChangeSet",
                "cloudformation:DescribeChangeSet",
                "cloudformation:ExecuteChangeSet",
                "cloudformation:CreateStack"
            ],
            "Resource": "arn:aws:cloudformation:us-east-1:ACCOUNT_ID:stack/aws-sam-cli-managed-default/*"
        },
        {
            "Sid": "Lambda",
            "Effect": "Allow",
            "Action": [
                "lambda:CreateFunction",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:DeleteFunction",
                "lambda:GetFunction",
                "lambda:GetFunctionConfiguration",
                "lambda:ListTags",
                "lambda:TagResource",
                "lambda:UntagResource",
                "lambda:AddPermission",
                "lambda:RemovePermission",
                "lambda:InvokeFunction"
            ],
            "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:washbear-discord-app-*"
        },
        {
            "Sid": "DynamoDB",
            "Effect": "Allow",
            "Action": [
                "dynamodb:CreateTable",
                "dynamodb:DeleteTable",
                "dynamodb:DescribeTable",
                "dynamodb:UpdateTable",
                "dynamodb:ListTagsOfResource",
                "dynamodb:TagResource",
                "dynamodb:UntagResource"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/uscf-sent-events"
        },
        {
            "Sid": "EventBridge",
            "Effect": "Allow",
            "Action": [
                "events:PutRule",
                "events:DeleteRule",
                "events:DescribeRule",
                "events:PutTargets",
                "events:RemoveTargets"
            ],
            "Resource": "arn:aws:events:us-east-1:ACCOUNT_ID:rule/washbear-discord-app-*"
        },
        {
            "Sid": "IAMRolesForLambda",
            "Effect": "Allow",
            "Action": [
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:GetRole",
                "iam:PassRole",
                "iam:PutRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:GetRolePolicy",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "iam:TagRole",
                "iam:UntagRole"
            ],
            "Resource": "arn:aws:iam::ACCOUNT_ID:role/washbear-discord-app-*"
        }
    ]
}
```

## Notes

- `resolve_s3 = true` in `samconfig.toml` means SAM auto-creates and manages an S3 bucket for artifacts. The bucket name follows the pattern `aws-sam-cli-managed-default-samclisourcebucket-*`. If you use a fixed bucket instead, scope the S3 permissions to that bucket.
- `CAPABILITY_IAM` is required because the stack creates an IAM execution role for the Lambda function.
- The `InvokeFunction` permission under Lambda is for running seed mode (`aws lambda invoke`). Remove it if the deployer doesn't need to invoke directly.
- The `S3ResolveBucket` statement allows SAM to manage its own bootstrap stack for the artifact bucket. This is only needed on first deploy.
- For teardown (`sam delete`), the same permissions cover resource deletion.
