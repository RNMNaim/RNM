# RNM

we going to use a microservices architecture where split down the system into small and scalable components

### 1. website
contains the code for the website (frontend) 

Nextjs

### 2. Server
contains the code to check the job status and get results, and some secondary data


Bunjs


### 3. ImageUplading 
a service that can be replicated to achieve concurrent uploads and puts a job inside the pubsub system
and exposes it's filesystem with the worker 


Bunjs


### 4. Worker 
takes one job at time, and uses Google Gemini API to upload the picture and get data then store it in the redis database

Nodejs

### 5. Redis
the primary database with pubsub system



# how it works
* we are going to use Docker, Dockercompose as orchastration 

* it's going to be deployed in dedicated Linux machine (VM)

* uses nginx as the gateway 

* simple a prof-of-work algorithm to generate acceptable tokens, so we prevent spams

* website generate a valide token, image get uploaded, a job inserted inside a queue, a worker take one job at time and uses Gemini API, store the result in Redis database, website keeps checking the result of the image



# Automation
any updates to the production branche will cause a full redeploymet of the entire system, dockercompose ensures no downtime


the ImageUploading system will have N replicat, where N is the number of CPU in the server, this way we maximize the number of concurrent uploads