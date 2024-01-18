# GitHub Committer

<img width="635" alt="image" src="https://github.com/Satttoshi/github-comitter/assets/109807794/91741062-8e4d-4c45-a13c-803aeb49cba0">

## Description

- Set commits to specific dates and times, 
- Custom commit messages
- Bulk commit with The GitHub Committer

This project creates commits and pushes them to a remote repository on GitHub to create Contributions.
Its purpose is to mirror commits manually made within projects where you do not have direct access to your git account.

!!! Please do not use this to fake your contributions to other projects. !!!

## Getting Started

### Dependencies

* NodeJS
* NPM
* Git
* GitHub Account

### Installing

Hint: This project is meant to run locally on your machine. It is not meant to be deployed to a server.

* Clone this repository
* Run `npm install` to install dependencies
* Set up your GitHub account to allow access to your repository
* Delete the `.git` folder
* Create a new repository on GitHub and push this Repository to it, don't fork it!
* Config your git name and Email with
`git config --global user.name "John Doe"` and `git config --global user.email`.
If you only want the credentials within this repository, then remove the `--global` flag
* Run `npm run dev` to start the application

### Usage

* Open your browser and navigate to `http://localhost:3000`

All your commits being stored in the [COMMITS.md](src/commits/COMMITS.md) file,
where you can check the latest commits, the message and their timestamps.
