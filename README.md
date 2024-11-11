# scandi 🪪
Scan ID documents

Live version [here](https://d2upewxnc2lyk3.cloudfront.net) 🚀
(please wait around 5 seconds after uploading to click on Get Details 😄)

# Table of Contents

  - [Architecture](#architecture)
    - [Design choices made in developing this app](#design-choices-made-in-developing-this-app)
  - [Code structure](#code-structure)
    - [1. infra](#1-infra)
    - [2. packages/frontend](#2-packagesfrontend)
    - [3. packages/backend](#3-packagesbackend)
  - [Use scandi](#use-scandi)
    - [Local deployment and development](#local-deployment-and-development)
  - [Areas of improvement](#areas-of-improvement)

## Architecture
A simplified view of the architecture is present [here](https://miro.com/app/board/uXjVK3HxiQY=/?share_link_id=768182066639)

#### Design choices made in developing this app
1. I've set up the app using the SST framework since it helps to manage and debug serverless apps locally quite easily.
2. The form on the frontend uploads images direct to S3 using a pre-signed url. This de-couples uploading from the backend, and any processing can be done later on from S3.
3. A subscriber function picks up images from S3 bucket and extracts text from the images, and stores the extracted info in a DynamoDB table.
4. The user has to manually click on get details to get the extracted details from the database. This is not ideal, but was done since the workflow itself is asynchronous, and in the interest of time.

### Code structure
scandi source code is organised in a monorepo. Theres' three parts: `infra`, `packages/frontend` and `packages/backend`
#### 1. `infra`
This is where the infrastructure of the app is managed. SST makes it simple to manage infrastructure as code(IaC), and it uses Pulumi providers and terraform under the hood.
In here we have infrastructre for the frontend (a NextJS app), storage (including DynamoDB table and S3 buckets) and the api.

SST allows us to "link" resources and manages permissions for us. This lets us access the S3 bucket in the Next frontend for eg, to upload passport images. The same bucket can be accessed by lambdas that are part of our backend as well.

#### 2. `packages/frontend`
This is basically a NextJS app scaffolded using [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app)

#### 3. `packages/backend`
Here we have lamdba functions that form our backend, one to extract text when an image is uploaded, and another one to fetch the extracted data. This would ideally be organised further to separate the "infrastructure" part of lambdas and Textract from any sort of business logic, for now I've kept them in the same place.

## Use scandi
You can access the live version of the app at: [https://d2upewxnc2lyk3.cloudfront.net](https://d2upewxnc2lyk3.cloudfront.net)

#### Local deployment and development
1. Ensure you have AWS CLI installed and configured with your credentials - SST uses your CLI credentials to manage resources
2. run ```npx sst dev``` - this runs the NextJS app locally, and routes lambda events to your machine, so you get instant hot reloading and debugging!

## Areas of improvement
1. Unit/Integration/E2E Tests - tests are missing, and ideally I'd start from the tests first. In this case, I focused more on rapid iteration by testing locally.
2. Ability to see extracted details automatically - either using a push notification or polling or a combination of both.
3. Ability to handle poor image quality - I've found blurry images don't work super well with AWS Textract, so make sure you have a good quality image. If you'd like you can use one of the images under example images to test.
4. Code organisation - as the app gets more complex, I'd split code based on hexagonal architecture principles.
5. Error Handling - There are some basic logs and errors, I'd like to improve error handling by creating custom errors with useful messages on the frontend. The workflow itself is asynchronous, so ideally there'll be a way to notify the user of any processing errors as well (eg image too blurry)
6. User authentication - userId is hardcoded at the moment, adding users and authentication will make the app more useful and secure.
