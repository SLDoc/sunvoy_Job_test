## Reverse Engineering Sunvoy Challenge
# Overview
This project focuses on reverse engineering a legacy web application challenge.sunvoy.com to programmatically retrieve user data and details of the currently authenticated user. Since the application lacks a public API, we extract the required data by calling internal endpoints.

## Setup Instructions
# Prerequisites
Node.js (Latest LTS version recommended)

Git (for repository management)

npm (included with Node.js)

## Installation
Clone this repository:

# bash
git clone https://github.com/SLDoc/sunvoy_job_test.git
cd sunvoy_job_test
# Install dependencies:

# bash
npm install

# Run the script: 
npm start

## Features

Dynamically authenticate user using terminal.

Extract Users list 

Extract Logged user information

Reuses authentication credentials for subsequent runs when still valid.

Minimal dependencies for lightweight execution.

Execution
After running the script, a users.json file will be generated containing list of users.

Also another auth.bin file will hold user session information.

Details of the currently authenticated user.

Authentication Handling
The script ensures that login credentials are reused when valid, reducing unnecessary re-authentication.

## Video
https://www.loom.com/share/cca8dac6b36644de833c3f89879ad9e4?sid=debfad5c-4501-47f5-9200-dd2960c49ac8

## Summary

✔ Authentication is done dynamically through terminal.  
✔ Extracting all users after login.  
✔ Extracting user logged data.  
✔ Using same session for retrieving data.  
✔ Storing users and logged account info locally in users.json.  
✔ Extra logout functionality is provided.  
✔ Task completed 100%.
