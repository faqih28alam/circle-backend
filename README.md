# ⭕ Stage 2 Circle App - BackEnd
This is the core API for **Circle**, a high-performance social media platform inspired by Threads and Twitter. It handles user authentication, thread management, and real-time social interactions. 

## 🛠️ Tech Stack
* **Language:** TypeScript
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL (or your chosen DB)
* **ORM:** Prisma

## 📂 Database Schema (ERD)
The database architecture follows a relational model designed for social graph scalability:
- **Users:** Core identity data.
- **Threads:** Primary posts by users.
- **Replies:** Thread-specific comments.
- **Likes:** Junction table for thread engagements.
- **Following:** Self-referencing table for user-to-user relationships.

## 🛠️ How to Setup Express Backend 
```text
- make a folder to contain the project
- npm init -y                                               # to initiliaze Node.js Environment
- npm install express                                       # to install Express Framework
- npm install -D typescript ts-node-dev @types/express      # to install typscript
- npx tsc --init                                            # execute typescript package
- make dir src at root
- create app.ts file inside src
- edit tsconfig.json, define root folder ex: ("rootDir": "./src")
- edit package.json, define inside scripts "dev": "ts-node-dev --respawn src/app.ts"
- npm run dev                                               # to run app.ts

```

## 🛠️ How to Setup Prisma 6 with PostgreSQL
```text
- npm install prisma@6 --save-dev                           # install Prisma CLI v6
- npm install @prisma/client@6                              # install Prisma Client v6
- create database in pgAdmin (e.g., "circle_db")
- npx prisma init                                           # initialize Prisma folder
- edit .env file:
  DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"

- edit prisma/schema.prisma (Ensure URL is inside the datasource block):
    generator client {
    provider = "prisma-client-js"
    }

    datasource db {
        provider = "postgresql"
        url      = env("DATABASE_URL")
    }
- add model in schema.prisma
example:
model User {
  id            Int         @id @default(autoincrement())
  username      String      @unique
  full_name     String
  email         String      @unique
  password      String
  photo_profile String?
  bio           String?
  created_at    DateTime    @default(now())
  updated_at    DateTime    @updated_at

  // Relations
  threads       Thread[]
  replies       Reply[]
  likes         Like[]
  
  // Self-relation for Following system
  followers     Following[] @relation("following")
  following     Following[] @relation("follower")
}
- npx prisma generate                                       # generate the client code
- npx prisma migrate dev --name init                        # push schema to PostgreSQL
- npx prisma studio                                         # to see Data in localhost:555, execute at other bash
- edit src/connection/client.ts
```

## 🛠️ How to do Seeding
```text
- Edit the model in schema.prisma
    model User {
      id     Int     @id @default(autoincrement())
      name   String
      email  String  @unique
      orders Order[]
    }

    model Product {
      id     Int     @id @default(autoincrement())
      name   String
      price  Int
      stock  Int
      orders Order[]
    }

    model Order {
      id        Int @id @default(autoincrement())
      userId    Int
      productId Int
      quantity  Int

      user    User    @relation(fields: [userId], references: [id])
      product Product @relation(fields: [productId], references: [id])
    }
- npx prisma migrate dev --name init
- npx prisma generate
- add src/connection/seed.ts
- add your code seed.ts
- edit package.json,
    "prisma": {
        "seed": "ts-node src/connection/seed.ts"
      }, 
- npx prisma db seed
```
## 🛠️ How to Setup JWT
```text
- npm isntall joi jsonwebtoken bcrypt
- npm install -D @types/bcrypt @types/joi @types/jsonwebtoken
- add src/utils/jwt.ts for signature token and verification token 
- add jwt secret key in .env
JWT_SECRET=your-super-secret-key
- continue project to controllers / middlewares
```

## 🛠️ How to Setup Multer
```text
- npm install multer
- npm install -D @types/multer
- add src/utils/multer.ts
```

## 🛠️ How to Setup CORS
```text
- npm install cors
- npm install -D @types/cors
- add src/middlewares/cors.ts
```

## 🛠️ Step to setup project
```text
- Edit schema.prisma (Add your new model/fields).
- Edit seed.ts (Update your dummy data).
- Run npx prisma migrate dev --name init (This creates the migration and generates types).
- Run npx prisma migrate reset (This wipes the mess, applies migrations, generates types again, and runs your seed).
- Run npx prisma db seed (Execute the Seed, not necessary)
- install package: bycrypt, joi, jsonwebtoken
- Setup JWT
- Run npx prisma studio (check the database)
- add src/middlewares/auth-middleware.ts for authentication
- add src/routes/auth-route.ts for authentication
- add src/controllers/auth-controller.ts
```

## 📂 Project Structure
```text
├── prisma/
│   ├── schema.prisma           # Prisma Schema (v6 style)
│   └── migrations/             # Database migration history
├── src/
│   ├── app.ts                  # Entry point
│   ├── connection/
│   │   ├── seed.ts             # to perform seeding
│   │   └── client.ts           # Prisma Client instantiation
│   ├── routes/
│   │   ├── transferPoint-route.ts
│   │   ├── product-route.ts    
│   │   └── order-route.ts      
│   ├── controllers/
│   │   ├── transferPoint-controller.ts
│   │   ├── product-controller.ts
│   │   └── order-controller.ts
│   ├── utils/
│   │   ├── app-error.ts        # to handle error
│   │   └── jwt.ts              # to handle JWT
│   └── middlewares/            # to bridge proccess
│       ├── auth-middleware.ts                        # to handle authentication and authorization JWT
│       └── validateStockUpdate-middleware.ts         # to handle validation for stock update
├── .env                        # Environment variables (DB URL)
├── package.json
├── package-lock.json
└── tsconfig.json
```

## 🚀 Implementation Flow
```text
1. Setup TypeScript: Configure the compiler and folder structure.
2. Setup Prisma 6: Install specific version 6 to match learning materials.
3. Model Definition: Define the Product table in schema.prisma.
4. Seeding: Create Data based on model and insert Datas to the Database
5. Migration: Use npx prisma migrate dev to create the table in PostgreSQL.
6. Setup JWT for authentication
7. Controller Logic: Use prisma.product.create/findMany/update/delete in your controllers.
8. Middleware : to handle validation between process (perform ACID)

💡 Note on Naming Conventions: > In Express, it is common to use kebab-case (e.g., post-controller.ts) or camelCase for files. Consistency is key!
```

### 💡 Helpful Tips
- Prisma Client: In src/connection/client.ts, simply use:
```text
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

#### Notes
- Read about "naming convention files & folders in express js"
- tsconfig.json template:
```text
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "rootDir": "./src",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}

```
- prisma documentation : https://www.prisma.io/docs/getting-started/prisma-orm/add-to-existing-project/postgresql
- prisma CRUD : https://www.prisma.io/docs/orm/prisma-client/queries/crud