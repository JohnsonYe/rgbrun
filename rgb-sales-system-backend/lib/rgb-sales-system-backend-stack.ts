import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class RgbSalesSystemBackendStack extends cdk.Stack {

  readonly PARTITION_KEY_NAME: string = "PK";
  readonly SORT_KEY_NAME: string = "SK";
  readonly REGION: string = "us-west-2";
  readonly account: string = "559050237034";

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda Function for getSales
    const getSalesLambda = new lambda.Function(this, 'GetSalesLambda', {
      functionName: "getSalesHandler",
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'), // Path to the lambda folder
      handler: 'getSalesHandler.handler', // Reference the getSales.ts handler
      timeout: cdk.Duration.seconds(15),
      environment: {
        TABLE_NAME: 'SalesTable', // DynamoDB Table Name
      },
    });

    // Lambda Function for createSales
    const createSalesLambda = new lambda.Function(this, 'CreateSalesLambda', {
      functionName: "createSalesHandler",
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'), // Path to the lambda folder
      handler: 'createSalesHandler.handler', // Reference the createSales.ts handler
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: 'SalesTable', // DynamoDB Table Name
      },
    });

    // Lambda Function for createSales
    const updateSalesLambda = new lambda.Function(this, 'UpdateSalesLambda', {
      functionName: "UpdateSalesHandler",
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'), // Path to the lambda folder
      handler: 'UpdateSalesHandler.handler', // Reference the createSales.ts handler
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: 'SalesTable', // DynamoDB Table Name
      },
    });

    const salesTable = this.createSalesTable();

    salesTable.grantFullAccess(getSalesLambda);
    salesTable.grantFullAccess(createSalesLambda);
    salesTable.grantFullAccess(updateSalesLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'SalesApi', {
      restApiName: 'SalesApi',
      description: 'API Gateway for sales operations',
      deployOptions: {
        stageName: 'prod',
      },
    });

    // GET /sales with query parameters
    const salesResource = api.root.addResource('sales');
    salesResource.addMethod('GET', new apigateway.LambdaIntegration(getSalesLambda));

    // POST /sales
    salesResource.addMethod('POST', new apigateway.LambdaIntegration(createSalesLambda));
    salesResource.addMethod('PUT', new apigateway.LambdaIntegration(updateSalesLambda));

    salesResource.addCorsPreflight({
      allowOrigins: ['*'], // Allow all origins
      allowMethods: ["GET","OPTIONS","POST","PUT"], // Allowed methods
      allowHeaders: ["Content-Type", "Authorization"]
    });
  }

  

  createSalesTable(): dynamodb.Table {
    return new dynamodb.Table(this, 'SalesTable', {
      tableName: "SalesTable",
      partitionKey: { name: this.PARTITION_KEY_NAME, type: dynamodb.AttributeType.STRING },
      sortKey: { name: this.SORT_KEY_NAME, type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}