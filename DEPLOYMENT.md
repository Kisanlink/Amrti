# Amrti Deployment Guide

This guide covers the complete CI/CD pipeline setup for the Amrti React application using AWS CodeBuild, ECR, and ECS.

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CodeBuild project created
3. Amazon ECR repository created
4. Amazon ECS cluster and service configured
5. IAM roles with necessary permissions

## Files Overview

- `buildspec.yml` - AWS CodeBuild specification
- `Dockerfile` - Multi-stage Docker build configuration
- `nginx.conf` - Nginx configuration for serving React app
- `.dockerignore` - Docker build context optimization
- `docker-compose.yml` - Local development and testing
- `env.example` - Environment variables template

## AWS Setup

### 1. Create ECR Repository

```bash
aws ecr create-repository --repository-name amrti-app --region us-east-1
```

### 2. Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name amrti-cluster
```

### 3. CodeBuild IAM Role

Create an IAM role for CodeBuild with the following policies:
- `AmazonEC2ContainerRegistryFullAccess`
- `AmazonECS_FullAccess`
- `CloudWatchLogsFullAccess`
- Custom policy for Systems Manager Parameter Store (if using)

### 4. Environment Variables

Set these environment variables in your CodeBuild project:

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_DEFAULT_REGION` | AWS region | `us-east-1` |
| `AWS_ACCOUNT_ID` | Your AWS account ID | `123456789012` |
| `IMAGE_REPO_NAME` | ECR repository name | `amrti-app` |
| `ECS_CLUSTER_NAME` | ECS cluster name | `amrti-cluster` |
| `ECS_SERVICE_NAME` | ECS service name | `amrti-service` |
| `CONTAINER_NAME` | Container name in task definition | `amrti-container` |

## Pipeline Flow

1. **Source**: Code is pulled from your Git repository
2. **Pre-build**: 
   - Login to ECR
   - Set image tags based on commit hash
3. **Build**: 
   - Build Docker image
   - Tag images for ECR
4. **Post-build**: 
   - Push images to ECR
   - Create image definitions file
   - Update ECS service

## Local Development

### Build and Test Locally

```bash
# Build the Docker image
docker build -t amrti-app .

# Run locally
docker run -p 80:80 amrti-app

# Or use docker-compose
docker-compose up
```

### Test the Application

```bash
# Health check
curl http://localhost/health

# Application
curl http://localhost/
```

## ECS Task Definition

Create an ECS task definition with the following key configurations:

```json
{
  "family": "amrti-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "amrti-container",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/amrti-app:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/amrti-task",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## ECS Service Configuration

```json
{
  "serviceName": "amrti-service",
  "cluster": "amrti-cluster",
  "taskDefinition": "amrti-task",
  "desiredCount": 2,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-12345", "subnet-67890"],
      "securityGroups": ["sg-12345"],
      "assignPublicIp": "ENABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:region:account:targetgroup/name",
      "containerName": "amrti-container",
      "containerPort": 80
    }
  ]
}
```

## Security Considerations

1. **Environment Variables**: Store sensitive data in AWS Systems Manager Parameter Store
2. **IAM Roles**: Use least privilege principle
3. **Network Security**: Configure security groups and NACLs appropriately
4. **SSL/TLS**: Configure ALB with SSL certificate for HTTPS
5. **Container Security**: Regularly update base images and scan for vulnerabilities

## Monitoring and Logging

1. **CloudWatch Logs**: Container logs are automatically sent to CloudWatch
2. **CloudWatch Metrics**: Monitor CPU, memory, and network usage
3. **Health Checks**: Configure ALB health checks and container health checks
4. **Alarms**: Set up CloudWatch alarms for critical metrics

## Troubleshooting

### Common Issues

1. **Build Failures**: Check CodeBuild logs in CloudWatch
2. **ECR Push Issues**: Verify IAM permissions and repository existence
3. **ECS Deployment Issues**: Check task definition and service configuration
4. **Application Issues**: Review container logs in CloudWatch

### Debugging Commands

```bash
# Check ECR repositories
aws ecr describe-repositories

# Check ECS clusters
aws ecs list-clusters

# Check ECS services
aws ecs list-services --cluster amrti-cluster

# Check task status
aws ecs list-tasks --cluster amrti-cluster --service-name amrti-service

# Get task logs
aws logs get-log-events --log-group-name /ecs/amrti-task --log-stream-name ecs/amrti-container/TASK_ID
```

## Scaling and Performance

1. **Auto Scaling**: Configure ECS service auto scaling based on CPU/memory
2. **Load Balancing**: Use Application Load Balancer for high availability
3. **CDN**: Consider CloudFront for static asset delivery
4. **Caching**: Implement appropriate caching strategies

## Cost Optimization

1. **Right-sizing**: Monitor and adjust CPU/memory allocation
2. **Spot Instances**: Consider using Fargate Spot for non-critical workloads
3. **Reserved Capacity**: Use savings plans for predictable workloads
4. **Resource Cleanup**: Implement automated cleanup of unused resources
