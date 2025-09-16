
# TaskManagementBot - simplifying students learning

README for `TaskManagementBot`.

This bot is designed to automate students learning processes through Discord.

## Tech Stack

This bot was written using: `TypeScript, Bun, Drizzle ORM, PostgreSQL`

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-%23000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.com/)

[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-A0AF9D?style=for-the-badge&logo=drizzle&logoColor=white)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL=<server_name>://<username>:<password>@<host>:<port>/<database>`

`TOKEN=your_bot_token`

`TEACHER_ROLE_ID=teacher_role_id_here`

`ALLOWED_VOICE_CHANNEL_ID=voice_channel_id`

## Installation

Install TaskManagementBot with bun

#### Installation Instructions
1. Run `git clone https://github.com/werobin05/TaskManagementBot`
2. Run `cd TaskManagementBot`
3. Create `.env` file and fill it out with variables provided above (you can use `nano .env` or any other IDEs/text editors you prefer)
4. Run `bun install` to install required dependencies
5. Enter `bun dev` to run this bot

## Authors

- [@werobin05](https://www.github.com/werobin05)

